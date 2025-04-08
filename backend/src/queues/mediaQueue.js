const Queue = require('bull')

const mediaQueue = new Queue("media-processing", {
  redis: { host: "127.0.0.1", port: 6379 },
});

// Processus de traitement des médias
mediaQueue.process(async (job) => {
  console.log(`📸 Traitement du média : ${job.data.filePath}`);

  // Simuler un délai de traitement (exemple : compression vidéo)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log(`✅ Média traité : ${job.data.filePath}`);
});

module.exports = mediaQueue