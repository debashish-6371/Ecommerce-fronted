const CART_STORAGE_KEY = "forma-cart";

function readCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(savedCart)) {
      throw new TypeError("Saved shopping bag is not a list.");
    }
    const validCart = savedCart.filter((item) => (
      item
      && typeof item.name === "string"
      && Number.isFinite(item.price)
      && Number.isInteger(item.quantity)
      && item.quantity > 0
    ));
    if (validCart.length !== savedCart.length) {
      console.error("Some saved shopping bag entries were invalid and have been ignored.");
    }
    return validCart;
  } catch (error) {
    console.error("Unable to read the saved shopping bag.", error);
    return [];
  }
}

function updateBagCount(cart) {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".bag-count").forEach((element) => {
    element.textContent = `(${count})`;
  });
  document.querySelectorAll(".bag-link").forEach((button) => {
    button.setAttribute("aria-label", `Shopping bag, ${count} ${count === 1 ? "item" : "items"}`);
  });
}

const cart = readCart();
updateBagCount(cart);

document.querySelectorAll(".add-to-bag").forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.dataset.product;
    const productPrice = Number(button.dataset.price);
    if (!productName || !Number.isFinite(productPrice) || productPrice < 0) {
      console.error("Unable to add product: product details are invalid.");
      return;
    }

    const existingItem = cart.find((item) => item.name === productName);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ name: productName, price: productPrice, quantity: 1 });
    }

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Unable to save the shopping bag.", error);
    }
    updateBagCount(cart);
    const message = document.querySelector(".site-message");
    if (message) message.textContent = `${productName} added to your bag.`;
  });
});

document.querySelectorAll(".bag-link").forEach((button) => {
  button.addEventListener("click", () => {
    const message = document.querySelector(".site-message");
    if (!message) return;
    if (cart.length === 0) {
      message.textContent = "Your bag is empty. Explore the collection to find something you love.";
      return;
    }

    const itemSummary = cart.map((item) => `${item.name} × ${item.quantity}`).join(", ");
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    message.textContent = `Your bag: ${itemSummary}. Subtotal: $${total.toFixed(2)}.`;
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
if (menuToggle && mainNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    mainNav.classList.toggle("is-open", !isExpanded);
  });
  mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const filterButtons = document.querySelectorAll(".filter-button");
const productCards = document.querySelectorAll(".catalog-grid .product-card");
if (filterButtons.length && productCards.length) {
  const productCount = document.querySelector("[data-product-count]");
  const emptyMessage = document.querySelector(".empty-products");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      let visibleCount = 0;

      filterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.classList.toggle("is-active", isActive);
        filterButton.setAttribute("aria-pressed", String(isActive));
      });

      productCards.forEach((card) => {
        const isVisible = category === "all" || card.dataset.category === category;
        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (productCount) productCount.textContent = String(visibleCount);
      if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
    });
  });
}

document.querySelectorAll(".signup-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const message = document.querySelector(".site-message");
    if (message) message.textContent = "Thanks! Newsletter signup is a demo and isn't connected to a mailing service yet.";
    form.reset();
  });
});
