const KEY = "eder_mock_isPremium";

export function getMockIsPremium() {
  return localStorage.getItem(KEY) === "1";
}

export function setMockIsPremium(v) {
  localStorage.setItem(KEY, v ? "1" : "0");
}
