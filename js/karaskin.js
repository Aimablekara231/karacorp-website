const karaskinRoot = document.querySelector("[data-karaskin-root]");
const karaSkinProducts = Array.isArray(window.KARASKIN_PRODUCTS) ? window.KARASKIN_PRODUCTS : [];

if (karaskinRoot && karaSkinProducts.length) {
  const filterButtons = karaskinRoot.querySelectorAll("[data-skin-filter]");
  const productGrid = karaskinRoot.querySelector("[data-product-grid]");
  const cartItems = karaskinRoot.querySelector("[data-cart-items]");
  const cartCount = karaskinRoot.querySelector("[data-cart-count]");
  const cartSubtotal = karaskinRoot.querySelector("[data-cart-subtotal]");
  const cartCustom = karaskinRoot.querySelector("[data-cart-custom]");
  const cartSummary = karaskinRoot.querySelector("[data-cart-summary]");
  const checkoutForm = karaskinRoot.querySelector("[data-cart-form]");
  const checkoutStatus = karaskinRoot.querySelector("[data-cart-status]");
  const whatsappNumber = (karaskinRoot.dataset.whatsappNumber || "").replace(/\D/g, "") || "255000000000";
  const currency = new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });
  const cartKey = "karaskin-cart-v1";
  let activeFilter = "all";
  let cart = loadCart();

  function loadCart() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(cartKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.id && item.quantity > 0) : [];
    } catch {
      return [];
    }
  }

  function saveCart() {
    window.localStorage.setItem(cartKey, JSON.stringify(cart));
  }

  function productById(id) {
    return karaSkinProducts.find((product) => product.id === id);
  }

  function cartQuantity(id) {
    const item = cart.find((entry) => entry.id === id);
    return item ? item.quantity : 0;
  }

  function formatMoney(amount) {
    return currency.format(amount).replace("TSh", "TZS");
  }

  function productMediaStyle(product) {
    const tones = {
      sand: "linear-gradient(145deg, rgba(184,146,111,0.96), rgba(114,82,57,0.94))",
      gold: "linear-gradient(145deg, rgba(198,157,76,0.96), rgba(128,87,43,0.94))",
      cocoa: "linear-gradient(145deg, rgba(126,91,70,0.96), rgba(74,48,35,0.94))",
      green: "linear-gradient(145deg, rgba(70,108,83,0.96), rgba(32,53,42,0.94))",
      rose: "linear-gradient(145deg, rgba(170,118,116,0.96), rgba(100,60,66,0.94))"
    };
    const tone = tones[product.tone] || tones.sand;
    return `background:${tone};`;
  }

  function renderProducts() {
    const filtered = activeFilter === "all"
      ? karaSkinProducts
      : karaSkinProducts.filter((product) => product.category === activeFilter);

    productGrid.innerHTML = filtered.map((product) => `
      <article class="karaskin-product-card reveal is-visible">
        <div class="karaskin-product-media" style="${productMediaStyle(product)}" data-media-label="${product.mediaLabel}"></div>
        <div class="karaskin-product-copy">
          <div class="karaskin-product-meta">
            <span>${product.categoryLabel}</span>
            ${product.featured ? "<span>Featured</span>" : ""}
            ${product.priceType === "custom" ? "<span>Quote based</span>" : ""}
          </div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="karaskin-price">
            <strong>${product.priceLabel}</strong>
            <span>${product.unitLabel}</span>
          </div>
          <div class="karaskin-actions">
            <input type="number" min="1" step="1" value="${Math.max(cartQuantity(product.id), 1)}" aria-label="Quantity for ${product.name}" data-qty-input="${product.id}">
            <button class="btn btn-primary" type="button" data-add-product="${product.id}">Add to cart</button>
          </div>
        </div>
      </article>
    `).join("");
  }

  function updateCartSummary() {
    const items = cart
      .map((entry) => ({ ...entry, product: productById(entry.id) }))
      .filter((entry) => entry.product);

    const fixedTotal = items.reduce((sum, entry) => {
      if (entry.product.priceType !== "fixed") return sum;
      return sum + (entry.product.price * entry.quantity);
    }, 0);

    const customItems = items.filter((entry) => entry.product.priceType === "custom");
    const totalQty = items.reduce((sum, entry) => sum + entry.quantity, 0);

    cartCount.textContent = String(totalQty);
    cartSubtotal.textContent = items.length ? formatMoney(fixedTotal) : "TZS 0";
    cartCustom.textContent = customItems.length
      ? `${customItems.length} custom-priced item${customItems.length > 1 ? "s" : ""} requires confirmation`
      : "No custom-priced items in cart";

    if (!items.length) {
      cartItems.innerHTML = `
        <div class="karaskin-cart-empty">
          <h4>Your cart is empty.</h4>
          <p>Add products from the catalog, then use WhatsApp checkout to send the order directly for confirmation and delivery follow-up.</p>
        </div>
      `;
      cartSummary.hidden = true;
      return;
    }

    cartSummary.hidden = false;
    cartItems.innerHTML = items.map((entry) => `
      <article class="karaskin-cart-item">
        <div>
          <h4>${entry.product.name}</h4>
          <p>${entry.product.priceType === "fixed" ? `${formatMoney(entry.product.price)} each` : entry.product.priceLabel}</p>
          <div class="karaskin-cart-controls">
            <button type="button" aria-label="Reduce ${entry.product.name}" data-cart-change="${entry.product.id}" data-cart-delta="-1">-</button>
            <span>${entry.quantity}</span>
            <button type="button" aria-label="Increase ${entry.product.name}" data-cart-change="${entry.product.id}" data-cart-delta="1">+</button>
            <button type="button" class="text-link" data-cart-remove="${entry.product.id}">Remove</button>
          </div>
        </div>
        <strong>${entry.product.priceType === "fixed" ? formatMoney(entry.product.price * entry.quantity) : "Quote"}</strong>
      </article>
    `).join("");
  }

  function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach((button) => {
      const isActive = button.dataset.skinFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts();
  }

  function addToCart(id, quantity) {
    const product = productById(id);
    if (!product) return;
    const qty = Math.max(1, Number(quantity) || 1);
    const existing = cart.find((entry) => entry.id === id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ id, quantity: qty });
    }
    saveCart();
    updateCartSummary();
  }

  function changeCart(id, delta) {
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;
    item.quantity += delta;
    cart = cart.filter((entry) => entry.quantity > 0);
    saveCart();
    updateCartSummary();
    renderProducts();
  }

  function removeFromCart(id) {
    cart = cart.filter((entry) => entry.id !== id);
    saveCart();
    updateCartSummary();
    renderProducts();
  }

  function buildWhatsAppMessage(formData) {
    const items = cart
      .map((entry) => ({ ...entry, product: productById(entry.id) }))
      .filter((entry) => entry.product);

    const fixedTotal = items.reduce((sum, entry) => {
      if (entry.product.priceType !== "fixed") return sum;
      return sum + (entry.product.price * entry.quantity);
    }, 0);

    const lines = [
      "Hello KaraSkin, I would like to place an order.",
      "",
      `Name: ${formData.get("full_name") || ""}`,
      `Phone: ${formData.get("phone") || ""}`,
      `Delivery area: ${formData.get("delivery_area") || ""}`,
      `Preferred contact: ${formData.get("contact_preference") || ""}`,
      ""
    ];

    lines.push("Order items:");
    items.forEach((entry, index) => {
      const priceText = entry.product.priceType === "fixed"
        ? `${formatMoney(entry.product.price * entry.quantity)}`
        : "Custom price - please confirm";
      lines.push(`${index + 1}. ${entry.product.name} x ${entry.quantity} - ${priceText}`);
    });

    lines.push("");
    lines.push(`Estimated fixed total: ${formatMoney(fixedTotal)}`);

    if (items.some((entry) => entry.product.priceType === "custom")) {
      lines.push("Note: Cart includes custom-priced items that need final confirmation.");
    }

    const notes = formData.get("message");
    if (notes) {
      lines.push("");
      lines.push(`Additional notes: ${notes}`);
    }

    return lines.join("\n");
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.skinFilter || "all"));
  });

  productGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-product]");
    if (addButton) {
      const id = addButton.dataset.addProduct;
      const input = productGrid.querySelector(`[data-qty-input="${id}"]`);
      addToCart(id, input ? input.value : 1);
      if (checkoutStatus) checkoutStatus.textContent = "";
      return;
    }

    const changeButton = event.target.closest("[data-cart-change]");
    if (changeButton) {
      changeCart(changeButton.dataset.cartChange, Number(changeButton.dataset.cartDelta || 0));
      return;
    }

    const removeButton = event.target.closest("[data-cart-remove]");
    if (removeButton) {
      removeFromCart(removeButton.dataset.cartRemove);
    }
  });

  cartItems.addEventListener("click", (event) => {
    const changeButton = event.target.closest("[data-cart-change]");
    if (changeButton) {
      changeCart(changeButton.dataset.cartChange, Number(changeButton.dataset.cartDelta || 0));
      return;
    }
    const removeButton = event.target.closest("[data-cart-remove]");
    if (removeButton) {
      removeFromCart(removeButton.dataset.cartRemove);
    }
  });

  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!cart.length) {
      checkoutStatus.textContent = "Add at least one product before sending the order.";
      checkoutStatus.classList.add("is-error");
      checkoutStatus.classList.remove("is-success");
      return;
    }

    const formData = new FormData(checkoutForm);
    if (!formData.get("full_name") || !formData.get("phone") || !formData.get("delivery_area")) {
      checkoutStatus.textContent = "Please provide your name, phone number, and delivery area.";
      checkoutStatus.classList.add("is-error");
      checkoutStatus.classList.remove("is-success");
      return;
    }

    const message = buildWhatsAppMessage(formData);
    checkoutStatus.textContent = "Opening WhatsApp with your order summary...";
    checkoutStatus.classList.add("is-success");
    checkoutStatus.classList.remove("is-error");
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  });

  setFilter("all");
  updateCartSummary();
}
