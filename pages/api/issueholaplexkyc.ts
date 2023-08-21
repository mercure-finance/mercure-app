import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = "https://api.holaplex.com";
const API_TOKEN = process.env.HOLAPLEX_API_TOKEN;

const headers = {
  Authorization: API_TOKEN,
  "Content-Type": "application/json",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { collectionId, recipientWalletAddress, creatorWalletAddress } =
    req.body;

  const mutation = `
    mutation MintToCollection($input: MintToCollectionInput!) {
      mintToCollection(input: $input) {
        collectionMint {
          id
          creationStatus
          compressed
        }
      }
    }
  `;

  const variables = {
    input: {
      collection: collectionId,
      recipient: recipientWalletAddress,
      compressed: false,
      creators: [
        {
          address: "EPkatMEFsRbohGELRDKsvQE6XNe1iy4evhjoGy4oHYkE",
          share: 100,
          verified: false,
        },
      ],
      metadataJson: {
        name: "KYC Token",
        symbol: "KYC",
        description:
          "This is a KYC Token that our backend will verify every time you buy a tokenized stock.",
        image: "https://noimage.com",
        attributes: [],
      },
    },
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      // @ts-ignore
      headers: headers,
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error minting to collection:", error);
    res.status(500).json({ error: "Failed to mint to collection" });
  }
}
