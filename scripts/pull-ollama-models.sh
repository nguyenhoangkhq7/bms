#!/bin/sh
set -eu

echo 'Waiting for Ollama (ai-engine) to start...'
while ! curl -s http://ai-engine:11434/api/tags > /dev/null; do
  sleep 1
done

echo 'Ollama is up! Starting to pull models...'

pull_model() {
  model_name="$1"
  if curl -s -o /dev/null -w '%{http_code}' \
    -H 'Content-Type: application/json' \
    -d "$(printf '{"name":"%s"}' "$model_name")" \
    http://ai-engine:11434/api/show | grep -q '^200$'; then
    echo "Model already exists, skipping: $model_name"
    return 0
  fi

  echo "Pulling model: $model_name"
  curl -s -X POST http://ai-engine:11434/api/pull -H 'Content-Type: application/json' \
    --data-binary "$(printf '{"name":"%s"}' "$model_name")"
}

echo '1. Pulling Vietnamese Embedding model...'
pull_model "$OLLAMA_EMBEDDING_MODEL"

echo '2. Pulling Qwen 2.5 Instruct...'
pull_model "$OLLAMA_CHAT_MODEL"

echo 'All models pulled successfully!'