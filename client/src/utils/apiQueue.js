// API Queue Manager to handle rate limiting and sequential processing
class APIQueue {
  constructor(maxConcurrent = 1, delayBetweenRequests = 2000) {
    this.queue = [];
    this.running = [];
    this.maxConcurrent = maxConcurrent;
    this.delayBetweenRequests = delayBetweenRequests;
  }

  async add(apiCall) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        apiCall,
        resolve,
        reject
      });
      this.process();
    });
  }

  async process() {
    if (this.running.length >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { apiCall, resolve, reject } = this.queue.shift();
    this.running.push(apiCall);

    try {
      const result = await apiCall();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running = this.running.filter(call => call !== apiCall);
      
      // Add delay before processing next request
      setTimeout(() => {
        this.process();
      }, this.delayBetweenRequests);
    }
  }
}

// Create singleton instance - Updated for paid tier
export const geminiQueue = new APIQueue(3, 1000); // 3 concurrent requests, 1 second delay