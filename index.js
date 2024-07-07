import cluster from "cluster";
import os from "os";
import http from "http";

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Set scheduling policy to round-robin
  cluster.schedulingPolicy = cluster.SCHED_RR;

  // Fork workers.
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Log when a worker exits and fork a new worker.
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection.
  // In this case, it is an HTTP server.
  http
    .createServer((req, res) => {
      const start = Date.now();
      console.log(`Worker ${process.pid} received request`);
      res.writeHead(200);
      res.end(`Hello from worker ${process.pid}`);
    })
    .listen(3000, () => {
      console.log(`Worker ${process.pid} started and listening on port 3000`);
    });
}
