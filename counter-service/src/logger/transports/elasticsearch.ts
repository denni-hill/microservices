import { ElasticsearchTransport } from "winston-elasticsearch";

export default function elasticsearchTransport() {
  return new ElasticsearchTransport({
    clientOpts: {}
  });
}
