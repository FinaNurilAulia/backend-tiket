export default {
  async fetch(request, env, ctx) {
    // Ambil URL dari request
    const url = new URL(request.url)
    
    // Ambil koneksi ke database D1 dari environment
    const db = env.DB

    // --- Tangani permintaan preflight CORS (OPTIONS) ---
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204, // Tidak ada konten, tapi berhasil
        headers: {
          "Access-Control-Allow-Origin": "*", // Izinkan semua origin
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", // Izinkan metode ini
          "Access-Control-Allow-Headers": "Content-Type" // Izinkan header Content-Type
        }
      })
    }

    // --- Tangani permintaan GET untuk semua tiket ---
    if (request.method === "GET" && url.pathname === "/tickets") {
      // Jalankan query untuk ambil semua data dari tabel tickets
      const { results } = await db.prepare("SELECT * FROM tickets").all()

      // Kembalikan hasilnya dalam format JSON
      return new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json", // Set header response sebagai JSON
          "Access-Control-Allow-Origin": "*" // Izinkan semua origin (CORS)
        }
      })
    }

    // --- Tangani permintaan POST untuk tambah tiket baru ---
    if (request.method === "POST" && url.pathname === "/tickets") {
      // Baca data JSON dari body request
      const data = await request.json()

      // Jalankan query untuk insert tiket ke database
      await db.prepare("INSERT INTO tickets (title, date, price) VALUES (?, ?, ?)")
        .bind(data.title, data.date, data.price) // Bind nilai dari request
        .run()

      // Kembalikan response sukses
      return new Response("Created", {
        status: 201, // Status 201 artinya berhasil dibuat
        headers: {
          "Access-Control-Allow-Origin": "*" // Izinkan semua origin
        }
      })
    }

    // --- Tangani permintaan PUT untuk update tiket berdasarkan ID ---
    if (request.method === "PUT" && url.pathname.startsWith("/tickets/")) {
      // Ambil ID dari URL path, misalnya: /tickets/3
      const id = url.pathname.split("/")[2]

      // Baca data JSON dari body request
      const data = await request.json()

      // Jalankan query untuk update tiket sesuai ID
      await db.prepare("UPDATE tickets SET title = ?, date = ?, price = ? WHERE id = ?")
        .bind(data.title, data.date, data.price, id) // Bind data dan ID
        .run()

      // Kembalikan response sukses
      return new Response("Updated", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    // --- Tangani permintaan DELETE untuk hapus tiket berdasarkan ID ---
    if (request.method === "DELETE" && url.pathname.startsWith("/tickets/")) {
      // Ambil ID dari URL path
      const id = url.pathname.split("/")[2]

      // Jalankan query untuk hapus tiket sesuai ID
      await db.prepare("DELETE FROM tickets WHERE id = ?")
        .bind(id)
        .run()

      // Kembalikan response sukses
      return new Response("Deleted", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
    }

    // --- Default: jika tidak ada rute yang cocok ---
    return new Response("Not Found", {
      status: 404, // Rute tidak ditemukan
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    })
  }
}
 