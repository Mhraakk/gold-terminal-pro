# typesafe-local (Zarin)

Upstream: [aabolfazl/typesafe-local](https://github.com/aabolfazl/typesafe-local)

Local **System One** server: encode a document once, ask typed questions (`noul` / `choice` / `score`), get calibrated probabilities - no free-text generation.

## Requirements

- **Apple Silicon (MLX)** for running the model
- Python 3.11+ with the upstream venv (`mlx-lm`, `fastapi`, `uvicorn`, `numpy`)

Vercel production **cannot** run MLX. Keep `TYPESAFE_LOCAL_URL` empty on Vercel; use it only on a Mac (or tunnel to one).

## Run the server

```bash
gh repo clone aabolfazl/typesafe-local
cd typesafe-local
python3 -m venv .venv
.venv/bin/pip install "mlx-lm>=0.20" fastapi uvicorn numpy
.venv/bin/python -m ots.server
```

Health: `GET http://127.0.0.1:8000/health`  
API: `POST http://127.0.0.1:8000/v1/systemone`

## Zarin client

```ts
import { askSystemOne } from "@/lib/typesafe-local";

const result = await askSystemOne({
  state: { note: "Gold note with rumor about export limits." },
  questions: {
    rumor: {
      type: "noul",
      instructions: "Does this note claim an unverified rumor?",
    },
    urgency: {
      type: "score",
      instructions: "How urgent is this for a gold desk?",
      criteria: ["Low", "Medium", "High"],
    },
  },
});
```

Env (local `.env`):

```bash
TYPESAFE_LOCAL_URL=http://127.0.0.1:8000
```

Call **server-side only** (never from the browser to localhost on a remote user's machine).
