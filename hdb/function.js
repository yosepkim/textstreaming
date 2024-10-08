function generateHashKey(stringInput) {
    const stringData = stringInput.replace(/\s/g, "");
    let hash = 0, i, chr;
    if (stringData.length === 0) return hash;
    for (i = 0; i < stringData.length; i++) {
      chr = stringData.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  }
  

const getAll = async (server, { hdbCore, logger }) => {
    server.get("/stream", async (request, reply) => {
        try {
            const question = request.query.question;

            const hashKey = generateHashKey(JSON.stringify(question));
            const selectQuery = {
                body: {
                    operation: 'search_by_id',
                    database: 'apicache',
                    table: 'cache',
                    ids: [hashKey],
                    get_attributes: ['id']
                }
            };

            const cachedPayload = await hdbCore.requestWithoutAuthentication(selectQuery);
            if (cachedPayload.length === 1) {
                delete cachedPayload[0]['id'];
                delete cachedPayload[0]['__createdtime__'];
                delete cachedPayload[0]['__updatedtime__'];

                reply.send(cachedPayload[0]);
            } else {
                const response = await fetch("https://origin-stream.edgecloud9.com/stream");

                reply.raw.writeHead(200, { 'Content-Type': 'application/stream+json' });
                for await (const part of response.body.values()) {
                    reply.raw.write(part);
                }

                const dbRecord = { 
                  id: hashKey,
                  content: response.body
                }
                const insertQuery = { 
                  body: {
                    operation: "upsert",
                    schema: "apicache",
                    table: "cache",
                    records: [dbRecord]
                  }
                };
                hdbCore.requestWithoutAuthentication(insertQuery);

                return reply.raw.end();
            }
        } catch (exception) {
            reply.send({ msg: `miami error occured: ${exception}`, detail: exception.message });
        }
    });
}
export default getAll;

