export function renderPetStats(pet) {
  const hungerBar = document.getElementById("hungerBar");
  const hungerValue = document.getElementById("hungerValue");
  const funBar = document.getElementById("funBar");
  const funValue = document.getElementById("funValue");
  const sleepBar = document.getElementById("sleepBar");
  const sleepValue = document.getElementById("sleepValue");
  const powerBar = document.getElementById("powerBar");
  const powerValue = document.getElementById("powerValue");

  if (pet.stage !== "white" && pet.hungerTimer) {
    if (hungerBar) hungerBar.style.width = `${(pet.hunger / 10) * 100}%`;
    if (hungerValue) hungerValue.textContent = pet.hunger;
  }
  if (pet.stage !== "white" && pet.sleepTimer) {
    if (sleepBar) sleepBar.style.width = `${(pet.sleep / 10) * 100}%`;
    if (sleepValue) sleepValue.textContent = pet.sleep;
  }

  if (funBar) funBar.style.width = `${(pet.fun / 10) * 100}%`;
  if (funValue) funValue.textContent = pet.fun;
  if (powerBar) powerBar.style.width = `${(pet.power / 10) * 100}%`;
  if (powerValue) powerValue.textContent = pet.power;
}
