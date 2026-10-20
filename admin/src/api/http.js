// Pulls the API's own error message out of a failed response (the API replies with { message }).
export async function readError(response, fallback) {
    const data = await response.json().catch(() => ({}));
    return data.message || fallback;
}
