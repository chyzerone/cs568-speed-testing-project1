
const startButton = document.getElementById("startPing");
const statusText = document.getElementById("status");
const pingResult = document.getElementById("pingResult");
const dataUsage = document.getElementById("dataUsage");

const PING_SAMPLE_COUNT = 5;

async function measurePingOnce() {
    const startTime = performance.now();

    const response = await fetch("/api/ping", {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const responseBody = await response.arrayBuffer();
    const endTime = performance.now();

    return {
        durationMs: endTime - startTime,
        bodyBytes: responseBody.byteLength
    };
}

function calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

startButton.addEventListener("click", async () => {
    startButton.disabled = true;
    pingResult.textContent = "-- ms";
    dataUsage.textContent = "";

    try {
        statusText.textContent = "Bağlantı hazırlanıyor...";

        const warmup = await measurePingOnce();
        let totalBodyBytes = warmup.bodyBytes;

        const measurements = [];

        for (let i = 0; i < PING_SAMPLE_COUNT; i++) {
            statusText.textContent =
                `Ping ölçülüyor: ${i + 1}/${PING_SAMPLE_COUNT}`;

            const sample = await measurePingOnce();

            measurements.push(sample.durationMs);
            totalBodyBytes += sample.bodyBytes;
        }

        const medianPing = calculateMedian(measurements);

        pingResult.textContent = `${medianPing.toFixed(2)} ms`;

        dataUsage.textContent =
            `Alınan yanıt gövdeleri (ısınma dahil): ` +
            `${totalBodyBytes} byte`;

        statusText.textContent = "Ping testi tamamlandı.";

        console.log("Ping measurements (ms):", measurements);

    } catch (error) {
        statusText.textContent = `Test başarısız: ${error.message}`;
        console.error(error);

    } finally {
        startButton.disabled = false;
    }
});
