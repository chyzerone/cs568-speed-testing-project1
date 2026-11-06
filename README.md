# CS 568.A - Speed Testing (Project 1)

We built this web application for **CS 568.A - Contemporary Topics in Networking** at Özyeğin University.

**Team:** Emre Karataş and Furkan Çağatay Ekinci

**GitHub:** https://github.com/chyzerone/cs568-speed-testing-project1

**Live website:** https://cs568-speed-testing-project1.onrender.com/

## What our application does

Our application measures HTTP latency, download speed, and upload speed between a browser and our server. We wanted to keep the interface simple: the user presses **Start Test**, and the three tests run in this order:

**Ping -> Download -> Upload**

We display the result of each test, the time spent on each data transfer, and the amount of test data used. We implemented the measurements ourselves using Python and JavaScript, without a ready-made speed-testing library.

## Tools and files

- **Backend:** Python 3.14, FastAPI, Uvicorn
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Browser APIs:** Fetch, ReadableStream, XMLHttpRequest, `performance.now()`
- **Hosting:** Render Free, Frankfurt region
- **Version control:** Git and GitHub

```text
cs568-speed-testing-project1/
|-- main.py                 FastAPI application and API routes
|-- requirements.txt        Python dependencies
|-- README.md               Setup and project explanation
|-- .gitignore
|-- static/
|   |-- index.html          Main page
|   |-- app.js              Browser-side tests
|   |-- styles.css          Page styling
|   `-- favicon.svg         Website tab icon
`-- docs/
    `-- STATUS.md           Project progress and handoff notes
```

## Run the project locally (Windows)

We developed and tested the project on Windows using **Python 3.14.10**. Git, Python, and a modern browser are needed. We used VS Code, but it is not required.

1. Clone the repository and open its folder:

   ```powershell
   git clone https://github.com/chyzerone/cs568-speed-testing-project1.git
   cd cs568-speed-testing-project1
   ```

2. Create a virtual environment and install the packages:

   ```powershell
   py -3.14 -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

3. Start the server:

   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

4. Open **http://127.0.0.1:8000/**. You can also check **http://127.0.0.1:8000/health** (expected response: `{"status":"ok"}`) and **http://127.0.0.1:8000/docs** (FastAPI's API documentation).

Use **Ctrl+C** in the terminal to stop the server.

The local address (`127.0.0.1`) connects the browser to a server running on the *same computer*. We used it to check that the application works. For internet-path measurements, we use the deployed Render website.

## How we measure speed

### HTTP Ping

We send one warm-up request to `/api/ping` and then make five timed HTTP requests. For each timed request, we use `performance.now()` before sending and after reading the response. We show the **median** of those five results in milliseconds.

The server returns `ok` (two bytes). Counting the warm-up, six successful requests receive **12 bytes of response bodies**. We call this *HTTP Ping* because it includes HTTP and browser processing; it is **not** the same as ICMP ping.

### Download

The browser requests **8 MiB (8,388,608 bytes)** from `/api/download`. Our server streams the data in chunks, and JavaScript reads the entire response and checks the number of bytes received. We measure from just before the request until the response stream has been fully read.

To avoid generating a new large buffer for every request, the server repeatedly sends a pre-generated **256 KiB random-data block**. We disable caching in the requests and response, and check for an unexpected `Content-Encoding`. Repeating the block is a trade-off: it reduces server work, but it does not guarantee that every intermediary handles the data in the same way.

### Upload

We prepare **4 MiB (4,194,304 bytes)** of random data in the browser **before** starting the timer. Then we send it to `/api/upload` using `XMLHttpRequest`. The server reads the incoming data and responds with `received_bytes`.

We only accept the result if the server reports the expected byte count. Our upload time includes the wait for the server's HTTP response, not just the time spent sending the bytes over the network.

### Speed calculation and data use

We use the same formula for both directions:

```text
Mbps = (transferred_bytes * 8) / (elapsed_seconds * 1,000,000)
```

A byte has 8 bits. **MiB** uses 1,048,576 bytes, while the **MB** shown in the interface uses 1,000,000 bytes.

For a successful complete test, our counted data is:

| Test | Payload bytes |
|---|---:|
| Ping responses (warm-up included) | 12 |
| Download | 8,388,608 |
| Upload | 4,194,304 |
| **Total** | **12,582,924 (12.58 MB)** |

This is **test payload data**, not the full network traffic. HTTP headers, TLS/TCP/IP overhead, page assets, and other traffic are not included in our counter.

## Tests we ran

### First tests on Render (4 MiB download, 4 MiB upload)

| Run | HTTP Ping (ms) | Download (Mbps) | Upload (Mbps) |
|---|---:|---:|---:|
| 1 | 91.40 | 36.72 | 8.74 |
| 2 | 100.90 | 34.33 | 8.31 |
| 3 | 96.20 | 37.02 | 9.27 |
| **Average** | **96.17** | **36.02** | **8.77** |

After these tests, we noticed that our download measurement was short. We compared two download sizes:

| Download size | Measured speed | Time |
|---|---:|---:|
| 4 MiB | 33.18 Mbps | 1.011 s |
| 8 MiB | 43.73 Mbps | 1.535 s |

In this experiment, the 8 MiB result was about **31.8% higher**, but it used twice as much data. We chose a **single 8 MiB download** and kept the upload at 4 MiB. This is a fixed-size approach, not an adaptive algorithm.

### Later tests on Render (8 MiB download, 4 MiB upload)

| Test | HTTP Ping | Download | Upload |
|---|---:|---:|---:|
| Furkan - 8 MiB test | 85.90 ms | 43.19 Mbps | 8.12 Mbps |
| Furkan - English interface | 87.50 ms | 43.01 Mbps | 8.73 Mbps |
| Emre - 6 Nov 2026 | 57.80 ms | 50.02 Mbps | 49.87 Mbps |

These were recorded on different client setups or at different times. We do not treat them as repeated measurements under identical conditions.

### Comparison with Ookla Speedtest

We also checked two Frankfurt servers using Ookla:

| Ookla server | Ping | Download | Upload |
|---|---:|---:|---:|
| GSL Network - Frankfurt | 45 ms | 69.80 Mbps | 12.03 Mbps |
| Melbicom - Frankfurt | 50 ms | 65.48 Mbps | 9.95 Mbps |

Ookla's results were higher than our earlier tests, especially for download. We think the main possible reasons are different test servers, network routes, connection counts, and timing methods; Render Free resources may also matter. **We have not isolated one exact cause.** Our HTTP Ping number also cannot be compared directly with Ookla's ping as if both tools used the same method.

### Localhost test

On Emre's computer, our local test showed **6.40 ms HTTP Ping**, **2807.90 Mbps download**, and **1177.35 Mbps upload**. These numbers are much higher because the server and browser were on the same machine. We used localhost to test the code, not to report real internet speed.

## API routes

| Route | What it does |
|---|---|
| `GET /` | Serves the website |
| `GET /health` | Returns `{"status":"ok"}` |
| `GET /api/ping` | Returns `ok` for the HTTP latency test |
| `GET /api/download?size=N` | Streams N bytes (256 KiB to 32 MiB) |
| `POST /api/upload` | Receives the uploaded body and reports its byte count (up to 16 MiB) |

The Download API defaults to 4 MiB if no `size` parameter is supplied, but **our browser explicitly requests 8 MiB**.

## Hosting and limitations

We deployed the project to Render Free using the GitHub `main` branch, with these commands:

```text
Build: pip install -r requirements.txt
Start: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Our main limitations are:

- We use **one HTTP download connection** rather than the multi-connection approach used by many commercial speed-testing tools.
- The selected download/upload amounts are **fixed**. We tested different sizes, but we did not build a full adaptive sizing algorithm.
- Upload timing includes the server's acknowledgment, and HTTP Ping includes HTTP processing overhead.
- Render Free has limited shared resources and may need to wake up after inactivity. This can affect the first request and other measurements.
- The repeated 256 KiB download block and client-side progress updates can affect how the test behaves.
- Our payload counter does not include every byte sent over the network.

We kept the implementation simple enough to understand and explain, while checking the data counts and comparing our results with other tools. The numbers describe a connection to **our particular server**, not the maximum possible internet speed for every destination.

## Submission

We will submit the source files and this README in one ZIP archive named **`Karatas_Ekinci_project1.zip`**, following the course's `lastnames_project1.zip` naming rule. We will exclude local virtual environments, Git metadata, caches, and secrets.

For our demo, we will show one full test and explain the HTTP Ping method, byte verification, throughput formula, localhost versus Render, and the differences from Ookla.
