const charities = [
  { name: "First Tee Youth Access", rate: 18, raised: 18420 },
  { name: "Hospice Family Fund", rate: 12, raised: 12680 },
  { name: "Clean Water Rounds", rate: 15, raised: 15110 },
  { name: "Veterans Mobility Trust", rate: 20, raised: 21370 }
];

let plan = "Monthly";
let scores = [
  { date: "2026-04-18", value: 12 },
  { date: "2026-04-11", value: 28 },
  { date: "2026-04-03", value: 7 },
  { date: "2026-03-29", value: 34 },
  { date: "2026-03-22", value: 19 }
];

const adminData = {
  users: [
    ["Ava Morgan", "Active subscriber", "5 scores, First Tee Youth Access"],
    ["Rohan Shah", "Payment pending", "3 scores, Clean Water Rounds"],
    ["Mina Patel", "Active subscriber", "5 scores, Veterans Mobility Trust"]
  ],
  charities: charities.map((charity) => [
    charity.name,
    `${charity.rate}% contribution`,
    `$${charity.raised.toLocaleString()} raised`
  ]),
  draw: [
    ["Monthly draw", "Ready to run", "Generate five numbers and calculate prize tiers"],
    ["Prize pool", "$84,000", "40% jackpot, 35% four match, 25% three match"],
    ["Rollover rule", "Enabled", "Jackpot rolls over when there is no 5-match winner"]
  ],
  winners: [
    ["Pending verification", "4-match tier", "2 players require identity check"],
    ["Verified", "3-match tier", "18 players approved for payment"],
    ["Rollover watch", "5-match jackpot", "No verified jackpot winner yet"]
  ],
  reports: [
    ["Monthly revenue", "$84,000", "Subscriptions and renewals"],
    ["Charity allocation", "$12,940", "15.4% effective contribution"],
    ["Prize liability", "$71,060", "After charity reserve"]
  ]
};

const charitySelect = document.querySelector("#charity-select");
const selectedCharity = document.querySelector("#selected-charity");
const charityRate = document.querySelector("#charity-rate");
const selectedPlan = document.querySelector("#selected-plan");
const scoreForm = document.querySelector("#score-form");
const scoreList = document.querySelector("#score-list");
const scoreCount = document.querySelector("#score-count");
const scoreMessage = document.querySelector("#score-message");
const drawNumbers = document.querySelector("#draw-numbers");
const drawResult = document.querySelector("#draw-result");
const adminAccessForm = document.querySelector("#admin-access-form");
const adminControls = document.querySelector("#admin-controls");
const adminMessage = document.querySelector("#admin-message");
const adminPanel = document.querySelector("#admin-panel");
const adminLock = document.querySelector("#admin-lock");
let adminUnlocked = false;

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${dateString}T00:00:00`));
}

function setToday() {
  const today = new Date();
  document.querySelector("#score-date").value = today.toISOString().slice(0, 10);
}

function renderCharities() {
  charitySelect.innerHTML = charities
    .map((charity) => `<option value="${charity.name}">${charity.name}</option>`)
    .join("");
  updateCharity();
}

function updateCharity() {
  const charity = charities.find((item) => item.name === charitySelect.value) || charities[0];
  selectedCharity.textContent = charity.name;
  charityRate.textContent = `${charity.rate}%`;
  document.querySelector(".impact-meter span").style.setProperty("--value", `${charity.rate}%`);
}

function renderScores() {
  scores.sort((a, b) => b.date.localeCompare(a.date));
  scoreCount.textContent = `${scores.length}/5`;
  scoreList.innerHTML = scores
    .map(
      (score) => `
        <div class="score-item">
          <div>
            <strong>${formatDate(score.date)}</strong>
            <div class="small-note">Eligible monthly draw score</div>
          </div>
          <span class="score-badge">${score.value}</span>
        </div>
      `
    )
    .join("");
}

function addScore(event) {
  event.preventDefault();
  const date = document.querySelector("#score-date").value;
  const value = Number(document.querySelector("#score-value").value);

  if (!date) {
    scoreMessage.textContent = "Score date is required.";
    return;
  }

  if (value < 1 || value > 45) {
    scoreMessage.textContent = "Score must be between 1 and 45.";
    return;
  }

  if (scores.some((score) => score.date === date)) {
    scoreMessage.textContent = "A score already exists for that date.";
    return;
  }

  scores = [{ date, value }, ...scores].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  scoreMessage.textContent = "Score saved. Only the latest five are kept.";
  renderScores();
}

function uniqueDrawNumbers() {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return [...numbers].sort((a, b) => a - b);
}

function renderDraw(numbers = [7, 12, 18, 28, 34]) {
  drawNumbers.innerHTML = numbers.map((number) => `<span class="draw-ball">${number}</span>`).join("");
  const matched = scores.filter((score) => numbers.includes(score.value)).length;
  const jackpot = matched === 5 ? "$33,600 jackpot winner" : "$33,600 jackpot rolls over";
  drawResult.innerHTML = `
    <div class="result-line"><span>Your matching scores</span><strong>${matched}/5</strong></div>
    <div class="result-line"><span>5 match</span><strong>${jackpot}</strong></div>
    <div class="result-line"><span>4 match pool</span><strong>$29,400</strong></div>
    <div class="result-line"><span>3 match pool</span><strong>$21,000</strong></div>
  `;
}

function renderAdmin(tab = "users") {
  if (!adminPanel || !adminUnlocked) {
    return;
  }

  const title = {
    users: "Manage Users",
    charities: "Manage Charities",
    draw: "Run Monthly Draw",
    winners: "Verify Winners",
    reports: "View Reports"
  }[tab];

  const actionLabel = {
    users: "Suspend",
    charities: "Edit",
    draw: "Run Draw",
    winners: "Verify",
    reports: "Export"
  }[tab];

  adminPanel.innerHTML = `
    <div class="panel-head">
      <div>
        <p class="mini-label">Admin panel</p>
        <h3>${title}</h3>
      </div>
      <button class="button primary" type="button" id="admin-action">${actionLabel}</button>
    </div>
    <div class="${tab === "reports" ? "report-grid" : "admin-grid"}">
      ${adminData[tab]
        .map(
          ([name, status, detail]) => `
            <article class="admin-card">
              <h4>${name}</h4>
              <strong>${status}</strong>
              <p>${detail}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;

  const adminAction = document.querySelector("#admin-action");
  adminAction.addEventListener("click", () => {
    if (tab === "draw") {
      renderDraw(uniqueDrawNumbers());
      adminPanel.insertAdjacentHTML("beforeend", `<p class="form-message">Monthly draw has been run and the public draw panel was updated.</p>`);
      return;
    }

    adminPanel.insertAdjacentHTML("beforeend", `<p class="form-message">${actionLabel} action recorded for this prototype.</p>`);
  });
}

function setAdminAccess(isUnlocked) {
  if (!adminControls || !adminAccessForm || !adminPanel) {
    return;
  }

  adminUnlocked = isUnlocked;
  adminControls.classList.toggle("is-locked", !isUnlocked);
  adminAccessForm.classList.toggle("is-hidden", isUnlocked);
  if (isUnlocked) {
    adminMessage.textContent = "";
    renderAdmin();
  } else {
    adminPanel.innerHTML = "";
  }
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    plan = button.dataset.plan;
    selectedPlan.textContent = plan;
  });
});

document.querySelector("#signup-form").addEventListener("submit", (event) => {
  event.preventDefault();
  updateCharity();
});

charitySelect.addEventListener("change", updateCharity);
scoreForm.addEventListener("submit", addScore);
document.querySelector("#run-draw").addEventListener("click", () => renderDraw(uniqueDrawNumbers()));

if (adminAccessForm) {
  adminAccessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#admin-email").value.trim().toLowerCase();
    const code = document.querySelector("#admin-code").value;

    if (email === "admin@goodgolf.test" && code === "admin123") {
      setAdminAccess(true);
      return;
    }

    adminMessage.textContent = "Access denied. Use admin@goodgolf.test and admin123 for this prototype.";
  });
}

if (adminLock) {
  adminLock.addEventListener("click", () => {
    setAdminAccess(false);
    adminMessage.textContent = "Admin controls locked.";
  });
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderAdmin(button.dataset.tab);
  });
});

setToday();
renderCharities();
renderScores();
renderDraw();
setAdminAccess(false);
