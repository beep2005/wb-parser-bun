const server = Bun.serve({
    port: 8000,
    fetch(req){
        return new Response("hello");
    }
});


console.log("Hello via Bun!");

