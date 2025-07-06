const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server (server);

const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connect', (socket) => {
    console.log("Seorang pengguna telah terhubung (ID: ", socket.id , ")");

    // bergabung ke ruangan
    socket.on('join room', ({ room, username }) => {
        socket.join(room);

        // menyimpan informasi dari user di objek socket
        socket.username = username;
        socket.room = room;

        // log di terminal server
        console.log(`${username} (ID: ${socket.id}) telah bergabung ke ruangan ${room}`);

        // mengirim notifikasi ke semua user kecuali pengirim
        socket.to(room).emit('user notification', `${username} telah bergabung`);
    });

    socket.on('chat message', ({ message }) => {
        // mengirim pesan hanya ke user di ruangan yang sama
        io.to(socket.room).emit('chat message', {user: socket.username, message});
    });

    // menangani indikator sedang mengetik
    socket.on('typing', () => {
        socket.to(socket.room).emit('typing', socket.username);
    })

    socket.on('stop typing', () => {
        // memberi tahu user lain bahwa pengguna telah berhenti mengetik
        socket.to(socket.room).emit('stop typing');
    });

    socket.on('leave room', () => {
        if (socket.username && socket.room) {
            console.log(`${socket.username} telah keluar dari ruangan ${socket.room}`);

            socket.to(socket.room).emit('user notification', `${socket.username} telah keluar ruangan`);

            socket.leave(socket.room);
            socket.room = null;
            socket.username = null;
        }
    });

    socket.on('disconnect', () => {
        // log diterminal server
        if (socket.username && socket.room) {
            console.log(`${socket.username} (ID: ${socket.id}) telah meninggalkan ruangan ${socket.room}`);
        } else {
            console.log('Seorang pengguna telah terputus (ID: ', socket.id , ')');
        }
    });
});

server.listen(port, () => {
    console.log(`server berjalan di http://localhost${port}`);
});


