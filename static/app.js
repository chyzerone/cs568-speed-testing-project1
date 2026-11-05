
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

const downloadButton = document.getElementById("startDownload");
const downloadStatus = document.getElementById("downloadStatus");
const downloadResult = document.getElementById("downloadResult");
const downloadDetails = document.getElementById("downloadDetails");

// 4 MiB test payload
const DOWNLOAD_SIZE = 4 * 1024 * 1024;

async function measureDownload() {
    const url = `/api/download?size=${DOWNLOAD_SIZE}`;

    const startTime = performance.now();

    const response = await fetch(url, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const encoding = response.headers.get("Content-Encoding");

    if (encoding && encoding.toLowerCase() !== "identity") {
        throw new Error("Unexpected content encoding");
    }

    if (!response.body) {
        throw new Error("Response stream is unavailable");
    }

    const reader = response.body.getReader();
    let downloadedBytes = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        downloadedBytes += value.byteLength;

        const percentage =
            (downloadedBytes / DOWNLOAD_SIZE) * 100;

        downloadStatus.textContent =
            `İndiriliyor: ${percentage.toFixed(1)}%`;
    }

    const endTime = performance.now();

    if (downloadedBytes !== DOWNLOAD_SIZE) {
        throw new Error(
            `Incomplete download: ${downloadedBytes} bytes`
        );
    }

    const durationSeconds = (endTime - startTime) / 1000;

    if (durationSeconds <= 0) {
        throw new Error("Invalid measurement duration");
    }

    const speedMbps =
        (downloadedBytes * 8) /
        (durationSeconds * 1_000_000);

    return {
        speedMbps,
        durationSeconds,
        downloadedBytes
    };
}

downloadButton.addEventListener("click", async () => {
    downloadButton.disabled = true;
    downloadResult.textContent = "-- Mbps";
    downloadDetails.textContent = "";
    downloadStatus.textContent = "Download başlatılıyor...";

    try {
        const result = await measureDownload();

        downloadResult.textContent =
            `${result.speedMbps.toFixed(2)} Mbps`;

        const downloadedMB =
            result.downloadedBytes / 1_000_000;

        downloadDetails.textContent =
            `İndirilen: ${downloadedMB.toFixed(2)} MB | ` +
            `Süre: ${result.durationSeconds.toFixed(3)} s`;

        downloadStatus.textContent = "Download tamamlandı.";

        console.log("Download result:", result);

    } catch (error) {
        downloadStatus.textContent =
            `Download başarısız: ${error.message}`;

        console.error(error);

    } finally {
        downloadButton.disabled = false;
    }
});

// ==========================================
// UPLOAD SPEED TEST
// ==========================================

const uploadButton = document.getElementById("startUpload");
const uploadStatus = document.getElementById("uploadStatus");
const uploadResult = document.getElementById("uploadResult");
const uploadDetails = document.getElementById("uploadDetails");

const UPLOAD_SIZE = 4 * 1024 * 1024;

// Prepare the test payload before measuring upload time.
function createUploadData(sizeBytes) {
    const data = new Uint8Array(sizeBytes);
    const chunkSize = 65536;

    for (let offset = 0; offset < sizeBytes; offset += chunkSize) {
        const end = Math.min(offset + chunkSize, sizeBytes);

        crypto.getRandomValues(data.subarray(offset, end));
    }

    return data;
}

// Upload data and verify the amount received by the server.
function measureUploadSpeed(data) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let startTime = 0;

        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && event.total > 0) {
                const percentage =
                    (event.loaded / event.total) * 100;

                uploadStatus.textContent =
                    `Yükleniyor: ${percentage.toFixed(1)}%`;
            }
        });

        xhr.upload.addEventListener("load", () => {
            uploadStatus.textContent =
                "Veri gönderildi, sunucu doğruluyor...";
        });

        xhr.open("POST", "/api/upload", true);

        xhr.responseType = "json";
        xhr.timeout = 30000;

        xhr.setRequestHeader(
            "Content-Type",
            "application/octet-stream"
        );

        xhr.onload = () => {
            const endTime = performance.now();

            if (xhr.status !== 200) {
                reject(new Error(`HTTP ${xhr.status}`));
                return;
            }

            const receivedBytes = xhr.response?.received_bytes;

            if (
                xhr.response?.status !== "ok" ||
                receivedBytes !== data.byteLength
            ) {
                reject(new Error(
                    `Byte verification failed: ` +
                    `sent ${data.byteLength}, ` +
                    `received ${receivedBytes}`
                ));
                return;
            }

            const durationSeconds =
                (endTime - startTime) / 1000;

            if (durationSeconds <= 0) {
                reject(new Error("Invalid measurement duration"));
                return;
            }

            const speedMbps =
                (receivedBytes * 8) /
                (durationSeconds * 1_000_000);

            resolve({
                speedMbps,
                durationSeconds,
                uploadedBytes: receivedBytes
            });
        };

        xhr.onerror = () => {
            reject(new Error("Network error"));
        };

        xhr.ontimeout = () => {
            reject(new Error("Upload timed out"));
        };

        xhr.onabort = () => {
            reject(new Error("Upload cancelled"));
        };

        startTime = performance.now();
        xhr.send(data);
    });
}

// Connect the Upload button to the measurement function.
uploadButton.addEventListener("click", async () => {
    uploadButton.disabled = true;
    uploadResult.textContent = "-- Mbps";
    uploadDetails.textContent = "";

    try {
        uploadStatus.textContent = "Test verisi hazırlanıyor...";

        const data = createUploadData(UPLOAD_SIZE);

        uploadStatus.textContent = "Upload başlatılıyor...";

        const result = await measureUploadSpeed(data);

        const uploadedMB =
            result.uploadedBytes / 1_000_000;

        uploadResult.textContent =
            `${result.speedMbps.toFixed(2)} Mbps`;

        uploadDetails.textContent =
            `Yüklenen: ${uploadedMB.toFixed(2)} MB | ` +
            `Süre: ${result.durationSeconds.toFixed(3)} s`;

        uploadStatus.textContent = "Upload tamamlandı.";

        console.log("Upload result:", result);

    } catch (error) {
        uploadStatus.textContent =
            `Upload başarısız: ${error.message}`;

        console.error("Upload error:", error);

    } finally {
        uploadButton.disabled = false;
    }
});
