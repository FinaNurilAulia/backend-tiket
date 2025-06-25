export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const db = env.DB

    // --- Handle CORS preflight (OPTIONS). ---
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      })
    }

    // --- GET semua tiket. ---
    if (request.method === "GET" && url.pathname === "/tickets") {
      const { results } = await db.prepare("SELECT * FROM tickets").all()
      return new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    // --- POST tambah tiket ---
    if (request.method === "POST" && url.pathname === "/tickets") {
      const data = await request.json()
      await db.prepare("INSERT INTO tickets (title, date, price) VALUES (?, ?, ?)")
        .bind(data.title, data.date, data.price)
        .run()
      return new Response("Created", {
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    // --- PUT update tiket berdasarkan ID ---
    if (request.method === "PUT" && url.pathname.startsWith("/tickets/")) {
      const id = url.pathname.split("/")[2]
      const data = await request.json()
      await db.prepare("UPDATE tickets SET title = ?, date = ?, price = ? WHERE id = ?")
        .bind(data.title, data.date, data.price, id)
        .run()
      return new Response("Updated", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    // --- DELETE tiket berdasarkan ID ---
    if (request.method === "DELETE" && url.pathname.startsWith("/tickets/")) {
      const id = url.pathname.split("/")[2]
      await db.prepare("DELETE FROM tickets WHERE id = ?")
        .bind(id)
        .run()
      return new Response("Deleted", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    // --- Default jika route tidak ditemukan ---
    return new Response("Not Found", {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
  }
}
