# CS 568.A - Project 1: Speed Testing

## Project overview

**Team:** Emre Karataş and Furkan Çağatay Ekinci

**GitHub:** https://github.com/chyzerone/cs568-speed-testing-project1

**Live application:** https://cs568-speed-testing-project1.onrender.com/

We built a browser-based speed testing application using Python, FastAPI, and vanilla JavaScript. We run the backend on Render Free in the Frankfurt region. The user starts one test sequence, and the application measures HTTP Ping, Download, and Upload in that order.

## Implementation

We developed the project on Windows with Python 3.14.10, Git, and VS Code. The server provides the HTTP endpoints, while the browser handles timing, data transfers, and the results shown on the page.

- **HTTP Ping:** We send one warm-up request and five timed requests, then display the median round-trip duration. This is HTTP latency, not ICMP ping.
- **Download:** We request 8 MiB of data, read the response stream, and verify how many bytes arrived before calculating the speed.
- **Upload:** We prepare 4 MiB of data in the browser, send it to our server, and compare the number of bytes sent with the server's response.
- **Interface:** One **Start Test** button runs the three measurements in sequence. We show progress, results, transfer times, and counted data usage. We also added an English interface, team footer, and favicon.

For transfer speed, we use:

`Mbps = (transferred bytes * 8) / (elapsed seconds * 1,000,000)`

A successful full test counts 12 bytes of Ping response bodies (including the warm-up), 8,388,608 bytes of Download, and 4,194,304 bytes of Upload. The total is **12,582,924 bytes (12.58 MB)**. This includes the payloads we count, not all HTTP/TCP/TLS overhead or other browser traffic.

## Our tests and decisions

Our first Render tests used 4 MiB for both Download and Upload. Across three runs, the averages were **96.17 ms HTTP Ping**, **36.02 Mbps Download**, and **8.77 Mbps Upload**.

We then compared two Download sizes:

| Download size | Measured speed | Duration |
|---|---:|---:|
| 4 MiB | 33.18 Mbps | 1.011 s |
| 8 MiB | 43.73 Mbps | 1.535 s |

The 8 MiB transfer gave a higher measured speed in this experiment, so we kept **8 MiB Download and 4 MiB Upload** in the final version. We did not add a second preliminary download or a fully adaptive algorithm. This keeps the application and its data use straightforward.

We also recorded these successful runs:

| Test environment | HTTP Ping | Download | Upload |
|---|---:|---:|---:|
| Render, Furkan | 85.90 ms | 43.19 Mbps | 8.12 Mbps |
| Render, Furkan (English UI) | 87.50 ms | 43.01 Mbps | 8.73 Mbps |
| Render, Emre (6 November) | 57.80 ms | 50.02 Mbps | 49.87 Mbps |
| Localhost, Emre (6 November) | 6.40 ms | 2807.90 Mbps | 1177.35 Mbps |

We use localhost to check that our application works, not to estimate internet speed. When the browser and server are on the same computer, the data does not cross the external network. We also installed the dependencies and ran the application from a separate extracted project folder on port 8001; the Ping, Download, and Upload tests completed there.

For comparison, we tested Ookla against two Frankfurt servers:

| Ookla server | Ping | Download | Upload |
|---|---:|---:|---:|
| GSL Network | 45 ms | 69.80 Mbps | 12.03 Mbps |
| Melbicom | 50 ms | 65.48 Mbps | 9.95 Mbps |

Our Download results were generally lower than these Ookla results. We cannot attribute the whole difference to one cause: our test uses a single HTTP transfer, and the servers, routes, and test methods are not identical. Our HTTP Ping result is also not directly equivalent to every latency measurement reported by Ookla.

## Limitations

We kept the measurement method simple enough to implement and explain ourselves. The server repeats a 256 KiB random data block for Download, and the browser updates progress while receiving it. Server load, network conditions, connection setup, and these implementation choices can affect the results. Upload timing includes the time spent waiting for the server's acknowledgment. Render Free resources and cold starts can affect performance as well.

For installation steps, API details, and the measurement methods, see `README.md`.
