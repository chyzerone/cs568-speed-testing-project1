
const ui = {
    startButton: document.getElementById("startAll"),
    overallStatus: document.getElementById("overallStatus"),
    overallProgress: document.getElementById("overallProgress"),

    pingStatus: document.getElementById("pingStatus"),
    pingResult: document.getElementById("pingResult"),
    pingDetails: document.getElementById("pingDetails"),

    downloadStatus: document.getElementById("downloadStatus"),
    downloadResult: document.getElementById("downloadResult"),
    downloadDetails: document.getElementById("downloadDetails"),

    uploadStatus: document.getElementById("uploadStatus"),
    uploadResult: document.getElementById("uploadResult"),
    uploadDetails: document.getElementById("uploadDetails"),

    totalDownloaded: document.getElementById("totalDownloaded"),
    totalUploaded: document.getElementById("totalUploaded"),
    totalTransferred: document.getElementById("totalTransferred")
};

const PING_SAMPLE_COUNT = 5;
const DOWNLOAD_SIZE = 8 * 1024 * 1024;
const UPLOAD_SIZE = 4 * 1024 * 1024;

const usage = {
    downloadedBytes: 0,
    uploadedBytes: 0
};

function toMB(bytes) {
    return (bytes / 1_000_000).toFixed(2);
}

function calculateMbps(bytes, seconds) {
    if (seconds <= 0) {
        throw new Error("Invalid measurement duration");
    }

    return (bytes * 8) / (seconds * 1_000_000);
}

function updateUsage() {
    const total = usage.downloadedBytes + usage.uploadedBytes;

    ui.totalDownloaded.textContent =
        `İndirilen gövde verisi: ${toMB(usage.downloadedBytes)} MB`;

    ui.totalUploaded.textContent =
        `Yüklenen gövde verisi: ${toMB(usage.uploadedBytes)} MB`;

    ui.totalTransferred.textContent =
        `Toplam test gövdesi: ${toMB(total)} MB`;
}

function resetUI() {
    usage.downloadedBytes = 0;
    usage.uploadedBytes = 0;

    ui.overallProgress.value = 0;
    ui.overallStatus.textContent = "Test hazırlanıyor...";

    ui.pingStatus.textContent = "Bekliyor";
    ui.downloadStatus.textContent = "Bekliyor";
    ui.uploadStatus.textContent = "Bekliyor";

    ui.pingResult.textContent = "-- ms";
    ui.downloadResult.textContent = "-- Mbps";
    ui.uploadResult.textContent = "-- Mbps";

    ui.pingDetails.textContent = "";
    ui.downloadDetails.textContent = "";
    ui.uploadDetails.textContent = "";

    updateUsage();
}

// -----------------------------------------
// 1. HTTP PING TEST
// -----------------------------------------

async function measurePingOnce() {
    const startTime = performance.now();

    const response = await fetch("/api/ping", {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(`Ping HTTP ${response.status}`);
    }

    const body = await response.arrayBuffer();
    const durationMs = performance.now() - startTime;

    usage.downloadedBytes += body.byteLength;
    updateUsage();

    return {
        durationMs,
        bodyBytes: body.byteLength
    };
}

async function runPingTest() {
    ui.pingStatus.textContent = "Bağlantı hazırlanıyor...";

    const initialBytes = usage.downloadedBytes;
    await measurePingOnce(); // Warm-up request.

    const samples = [];

    for (let i = 0; i < PING_SAMPLE_COUNT; i++) {
        ui.pingStatus.textContent =
            `Ölçülüyor: ${i + 1}/${PING_SAMPLE_COUNT}`;

        const sample = await measurePingOnce();
        samples.push(sample.durationMs);
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const pingBytes = usage.downloadedBytes - initialBytes;

    ui.pingResult.textContent = `${median.toFixed(2)} ms`;

    ui.pingDetails.textContent =
        `Isınma dahil alınan yanıt gövdeleri: ${pingBytes} byte`;

    ui.pingStatus.textContent = "Tamamlandı";

    console.log("Ping results:", samples);

    return {
        medianMs: median,
        downloadedBytes: pingBytes
    };
}

// -----------------------------------------
// 2. DOWNLOAD SPEED TEST
// -----------------------------------------

async function runDownloadTest() {
    ui.downloadStatus.textContent = "İndirme başlıyor...";

    const startTime = performance.now();

    const response = await fetch(
        `/api/download?size=${DOWNLOAD_SIZE}`,
        { cache: "no-store" }
    );

    if (!response.ok) {
        throw new Error(`Download HTTP ${response.status}`);
    }

    const encoding = response.headers.get("Content-Encoding");

    if (encoding && encoding.toLowerCase() !== "identity") {
        throw new Error("Unexpected content encoding");
    }

    if (!response.body) {
        throw new Error("Download stream unavailable");
    }

    const reader = response.body.getReader();
    let downloadedBytes = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        downloadedBytes += value.byteLength;
        usage.downloadedBytes += value.byteLength;

        const percentage =
            (downloadedBytes / DOWNLOAD_SIZE) * 100;

        ui.downloadStatus.textContent =
            `İndiriliyor: ${percentage.toFixed(1)}%`;

        updateUsage();
    }

    const durationSeconds =
        (performance.now() - startTime) / 1000;

    if (downloadedBytes !== DOWNLOAD_SIZE) {
        throw new Error(
            `Incomplete download: ${downloadedBytes} bytes`
        );
    }

    const speedMbps =
        calculateMbps(downloadedBytes, durationSeconds);

    ui.downloadResult.textContent =
        `${speedMbps.toFixed(2)} Mbps`;

    ui.downloadDetails.textContent =
        `İndirilen: ${toMB(downloadedBytes)} MB | ` +
        `Süre: ${durationSeconds.toFixed(3)} s`;

    ui.downloadStatus.textContent = "Tamamlandı";

    const result = {
        speedMbps,
        durationSeconds,
        downloadedBytes
    };

    console.log("Download result:", result);

    return result;
}

// -----------------------------------------
// 3. UPLOAD SPEED TEST
// -----------------------------------------

function createUploadData(sizeBytes) {
    const data = new Uint8Array(sizeBytes);
    const chunkSize = 65536;

    for (let offset = 0; offset < sizeBytes; offset += chunkSize) {
        const end = Math.min(offset + chunkSize, sizeBytes);

        crypto.getRandomValues(data.subarray(offset, end));
    }

    return data;
}

function sendUpload(data) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let startTime;

        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && event.total > 0) {
                const percentage =
                    Math.min(100, event.loaded / event.total * 100);

                ui.uploadStatus.textContent =
                    `Yükleniyor: ${percentage.toFixed(1)}%`;
            }
        });

        xhr.upload.addEventListener("load", () => {
            ui.uploadStatus.textContent =
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
            const durationSeconds =
                (performance.now() - startTime) / 1000;

            if (xhr.status !== 200) {
                reject(new Error(`Upload HTTP ${xhr.status}`));
                return;
            }

            const receivedBytes = xhr.response?.received_bytes;

            if (
                xhr.response?.status !== "ok" ||
                receivedBytes !== data.byteLength
            ) {
                reject(
                    new Error("Upload byte verification failed")
                );
                return;
            }

            resolve({
                speedMbps: calculateMbps(
                    receivedBytes,
                    durationSeconds
                ),
                durationSeconds,
                uploadedBytes: receivedBytes
            });
        };

        xhr.onerror = () =>
            reject(new Error("Upload network error"));

        xhr.ontimeout = () =>
            reject(new Error("Upload timeout"));

        xhr.onabort = () =>
            reject(new Error("Upload aborted"));

        startTime = performance.now();
        xhr.send(data);
    });
}

async function runUploadTest() {
    ui.uploadStatus.textContent = "Test verisi hazırlanıyor...";

    const data = createUploadData(UPLOAD_SIZE);

    ui.uploadStatus.textContent = "Upload başlatılıyor...";

    const result = await sendUpload(data);

    // Count only server-confirmed upload bytes.
    usage.uploadedBytes += result.uploadedBytes;
    updateUsage();

    ui.uploadResult.textContent =
        `${result.speedMbps.toFixed(2)} Mbps`;

    ui.uploadDetails.textContent =
        `Yüklenen: ${toMB(result.uploadedBytes)} MB | ` +
        `Süre: ${result.durationSeconds.toFixed(3)} s`;

    ui.uploadStatus.textContent = "Tamamlandı";

    console.log("Upload result:", result);

    return result;
}

// -----------------------------------------
// COMPLETE TEST SEQUENCE
// -----------------------------------------

ui.startButton.addEventListener("click", async () => {
    ui.startButton.disabled = true;
    resetUI();

    let activeStatus = null;

    try {
        // Step 1: Ping
        ui.overallStatus.textContent = "1/3 - Ping ölçülüyor";
        activeStatus = ui.pingStatus;

        const ping = await runPingTest();
        ui.overallProgress.value = 1;

        // Step 2: Download
        ui.overallStatus.textContent = "2/3 - Download ölçülüyor";
        activeStatus = ui.downloadStatus;

        const download = await runDownloadTest();
        ui.overallProgress.value = 2;

        // Step 3: Upload
        ui.overallStatus.textContent = "3/3 - Upload ölçülüyor";
        activeStatus = ui.uploadStatus;

        const upload = await runUploadTest();
        ui.overallProgress.value = 3;

        ui.overallStatus.textContent =
            "Tüm testler başarıyla tamamlandı.";

        console.log("Complete speed test:", {
            ping,
            download,
            upload,
            usage: { ...usage }
        });

    } catch (error) {
        ui.overallStatus.textContent =
            `Test başarısız: ${error.message}`;

        if (activeStatus) {
            activeStatus.textContent =
                `Hata: ${error.message}`;
        }

        console.error("Speed test error:", error);

    } finally {
        ui.startButton.disabled = false;
    }
});
