document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("cards-container");
  const searchInput = document.querySelector(".search");
  const checkboxes = document.querySelectorAll(
    "aside input[type='checkbox']"
  );

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalFields = document.getElementById("modalFields");
  const modalTypes = document.getElementById("modalTypes");
  const modalDescription = document.getElementById("modalDescription");
  const modalLink = document.getElementById("modalLink");
  const closeModal = document.getElementById("closeModal");

  let allActivities = [];
  let filtered = [];
  let visibleCount = 6;

  try {
    const response = await fetch("activities.json");

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    allActivities = await response.json();
    filtered = [...allActivities];

    render();
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p style="color:red">
        Не удалось загрузить activities.json
      </p>
    `;
  }

  function render() {
    container.innerHTML = "";

    const activities = filtered.slice(0, visibleCount);

    activities.forEach(activity => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3 class="card-title">${activity.title || ""}</h3>

        <div class="card-field">
          ${(activity.fields || []).join(" • ")}
        </div>

        <p class="card-description">
          ${activity.shortDescription || ""}
        </p>

        <div class="card-tags">
          ${(activity.types || [])
            .map(type => `<span class="card-tag">${type}</span>`)
            .join("")}
        </div>
      `;

      card.addEventListener("click", () => {
        openModal(activity);
      });

      container.appendChild(card);
    });

    renderLoadMore();
  }

  function openModal(activity) {
    modalTitle.textContent = activity.title || "";

    modalFields.textContent =
      (activity.fields || []).join(" • ");

    modalDescription.textContent =
      activity.fullDescription ||
      activity.shortDescription ||
      "";

    modalTypes.innerHTML = (activity.types || [])
      .map(type => `<span>${type}</span>`)
      .join("");

    if (
      activity.link &&
      activity.link !== "нет ссылки"
    ) {
      modalLink.href = activity.link;
      modalLink.style.display = "flex";
    } else {
      modalLink.style.display = "none";
    }

    modal.classList.remove("hidden");
  }

  function renderLoadMore() {
    const oldBtn = document.getElementById("loadMore");

    if (oldBtn) {
      oldBtn.remove();
    }

    if (visibleCount < filtered.length) {
      const btn = document.createElement("button");

      btn.id = "loadMore";
      btn.textContent = "Загрузить ещё";

      btn.addEventListener("click", () => {
        visibleCount += 6;
        render();
      });

      container.appendChild(btn);
    }
  }

  function applyFilters() {
    const searchValue =
      searchInput.value.toLowerCase();

    const selected = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb =>
        cb.parentElement.textContent.trim()
      );

    filtered = allActivities.filter(activity => {
      const searchMatch =
        (activity.title || "")
          .toLowerCase()
          .includes(searchValue) ||
        (activity.fields || [])
          .join(" ")
          .toLowerCase()
          .includes(searchValue) ||
        (activity.types || [])
          .join(" ")
          .toLowerCase()
          .includes(searchValue);

      const filterMatch =
        selected.length === 0 ||
        selected.some(item =>
          (activity.fields || []).includes(item) ||
          (activity.types || []).includes(item)
        );

      return searchMatch && filterMatch;
    });

    visibleCount = 6;

    render();
  }

  searchInput.addEventListener(
    "input",
    applyFilters
  );

  checkboxes.forEach(cb => {
    cb.addEventListener(
      "change",
      applyFilters
    );
  });

  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});