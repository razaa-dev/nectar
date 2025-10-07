// Elements
const joinBtn = document.getElementById("join-now");
const createModal = document.getElementById("create-account-modal");
const createAccountBtn = document.getElementById("create-account-btn");
const closeModal = document.getElementById("close-modal");
const traderSection = document.getElementById("trader-id-section");
const submitId = document.getElementById("submit-id");
const verifySection = document.getElementById("verification-section");
const countdownEl = document.getElementById("countdown");
const homepage = document.getElementById("homepage");
const botPage = document.getElementById("bot-page");

// On load: if already verified -> show bot directly
if (localStorage.getItem("nectar_access") === "granted") {
  homepage.classList.add("hidden");
  botPage.classList.remove("hidden");
}

// Open create-account modal on Join Now
joinBtn.addEventListener("click", () => {
  createModal.classList.remove("hidden");
});

// Close modal (Back)
closeModal.addEventListener("click", () => {
  createModal.classList.add("hidden");
  // If user already clicked Create Account earlier, show trader ID automatically
  if (localStorage.getItem("nectar_registered") === "true") {
    traderSection.classList.remove("hidden");
  }
});

// When user clicks Create Account (referral)
// allow default anchor to open link in new tab; also mark registered and show trader ID
createAccountBtn.addEventListener("click", (e) => {
  // mark registered immediately so no refresh required
  localStorage.setItem("nectar_registered", "true");
  // close modal
  createModal.classList.add("hidden");
  // show trader id section now
  traderSection.classList.remove("hidden");
  // Note: anchor already opens referral due to target="_blank"
});

// Submit Trader ID -> start 15 min verification
submitId.addEventListener("click", () => {
  const id = document.getElementById("trader-id").value.trim();
  if (!id) { alert("Please enter your Trader ID"); return; }
  // store trader id; start timer
  localStorage.setItem("nectar_trader_id", id);
  traderSection.classList.add("hidden");
  verifySection.classList.remove("hidden");

  // persist verification end time so refresh doesn't break (optional)
  const end = Date.now() + 15 * 60 * 1000;
  localStorage.setItem("nectar_ver_end", String(end));

  // start countdown (resume-safe)
  startVerificationCountdown();
});

// Resume verification countdown if persisted
(function resumeVerification() {
  const verEnd = localStorage.getItem('nectar_ver_end');
  if (!verEnd) return;
  const end = Number(verEnd);
  if (Date.now() < end) {
    verifySection.classList.remove("hidden");
    startVerificationCountdown();
  } else {
    // already passed
    localStorage.setItem("nectar_access", "granted");
    localStorage.removeItem("nectar_ver_end");
    homepage.classList.add("hidden");
    botPage.classList.remove("hidden");
  }
})();

let verInterval = null;
function startVerificationCountdown(){
  clearInterval(verInterval);
  const verEnd = Number(localStorage.getItem('nectar_ver_end'));
  if (!verEnd) return;
  verInterval = setInterval(()=> {
    const rem = Math.max(0, Math.floor((verEnd - Date.now())/1000));
    const m = String(Math.floor(rem/60)).padStart(2,'0');
    const s = String(rem%60).padStart(2,'0');
    countdownEl.textContent = `${m}:${s}`;
    if (rem <= 0) {
      clearInterval(verInterval);
      localStorage.setItem("nectar_access", "granted");
      localStorage.removeItem('nectar_ver_end');
      verifySection.classList.add("hidden");
      homepage.classList.add("hidden");
      botPage.classList.remove("hidden");
      alert('Verification complete — Bot access granted.');
    }
  }, 1000);
}

/* ---------------- BOT SIGNAL CODE ---------------- */
const getSignalBtn = document.getElementById("getSignal");
const signalResult = document.getElementById("signalResult");
const timerDisplay = document.getElementById("timerDisplay");

function countdown(seconds) {
  getSignalBtn.disabled = true;
  const endTime = Date.now() + seconds*1000;
  const interval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((endTime - Date.now())/1000));
    timerDisplay.textContent = `⏳ ${remaining}s remaining`;
    if (remaining <= 0) {
      clearInterval(interval);
      timerDisplay.textContent = "";
      getSignalBtn.disabled = false;
      signalResult.textContent = "✅ Signal Completed. Ready for next.";
    }
  }, 1000);
}

getSignalBtn.addEventListener("click", () => {
  if (!navigator.onLine) {
    signalResult.textContent = "❌ No Internet Connection";
    signalResult.style.color = "red";
    return;
  }
  const asset = document.getElementById("asset").value;
  const timerValue = parseInt(document.getElementById("timer").value);
  if (!asset) {
    signalResult.textContent = "⚠️ Please select a currency!";
    signalResult.style.color = "#ff4d4d";
    return;
  }
  const direction = Math.random()>0.5 ? "📈 UP" : "📉 DOWN";
  signalResult.style.color = "#ffae00";
  signalResult.textContent = `${asset} → ${direction}`;
  countdown(timerValue);
});