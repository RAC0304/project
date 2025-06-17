export async function getPublicIP(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    if (!response.ok) throw new Error("Failed to fetch IP");
    const data = await response.json();
    return data.ip;
  } catch {
    return "";
  }
}
