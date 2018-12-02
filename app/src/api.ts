
const baseUrl = `http://${window.location.hostname}`;
const engineUrl = "https://engine.battlesnake.io";
const boardUrl = "https://board.battlesnake.io";

/**
 * Save code to the backend.
 *
 * @param id
 * @param code
 */
export async function save(id: string, code: string) {
  await fetch(`/apps/${id}/save`, {
    body: code,
    method: "POST",
    headers: { "content-type": "text/plain" }
  });
}

/**
 * Starts a game on the engine servers and returns the ID of the game so you can
 * start watching it.
 *
 * @param id
 * @param code
 */
export async function run(id: string) {
  const res = await fetch(`${engineUrl}/games`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      width: 10,
      height: 10,
      food: 4,
      snakes: [{ name: "Snake", id, url: snakeUrl(id) }]
    })
  });
  const game = await res.json();
  const gameId = game["ID"];

  await fetch(`${engineUrl}/games/${gameId}/start`, { method: "POST" });
  return encodeURI(`${boardUrl}?engine=${engineUrl}&game=${gameId}`);
}

export function snakeUrl(id: string) {
  return `${baseUrl}/apps/${id}`
}
