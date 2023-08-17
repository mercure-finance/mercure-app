export type OusiaBurnAndMint = {
  version: "0.1.0";
  name: "ousia_burn_and_mint";
  instructions: [
    {
      name: "placeBuyOrder";
      accounts: [
        {
          name: "usdcMintAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyerUsdcAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "oderAccountUsdcAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "purchaseTokenMintAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "buyerPurchaseTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "orderAccountPurchaseTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mintAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "orderAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "signer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "price";
          type: "u64";
        },
        {
          name: "id";
          type: "publicKey";
        },
        {
          name: "orderType";
          type: {
            defined: "OrderType";
          };
        }
      ];
    }
  ];
  accounts: [
    {
      name: "order";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u32";
          },
          {
            name: "price";
            type: "f64";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "orderType";
            type: {
              defined: "OrderType";
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "OrderType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Buy";
          },
          {
            name: "Sell";
          }
        ];
      };
    }
  ];
  events: [
    {
      name: "OrderPlaced";
      fields: [
        {
          name: "amount";
          type: "u32";
          index: false;
        },
        {
          name: "price";
          type: "f64";
          index: false;
        },
        {
          name: "mint";
          type: "publicKey";
          index: false;
        },
        {
          name: "orderAccount";
          type: "publicKey";
          index: false;
        },
        {
          name: "signer";
          type: "publicKey";
          index: false;
        },
        {
          name: "orderType";
          type: {
            defined: "OrderType";
          };
          index: false;
        }
      ];
    }
  ];
};

export const IDL: OusiaBurnAndMint = {
  version: "0.1.0",
  name: "ousia_burn_and_mint",
  instructions: [
    {
      name: "placeBuyOrder",
      accounts: [
        {
          name: "usdcMintAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyerUsdcAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "oderAccountUsdcAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "purchaseTokenMintAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "buyerPurchaseTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "orderAccountPurchaseTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mintAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "orderAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "price",
          type: "u64",
        },
        {
          name: "id",
          type: "publicKey",
        },
        {
          name: "orderType",
          type: {
            defined: "OrderType",
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: "order",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u32",
          },
          {
            name: "price",
            type: "f64",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "orderType",
            type: {
              defined: "OrderType",
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "OrderType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Buy",
          },
          {
            name: "Sell",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "OrderPlaced",
      fields: [
        {
          name: "amount",
          type: "u32",
          index: false,
        },
        {
          name: "price",
          type: "f64",
          index: false,
        },
        {
          name: "mint",
          type: "publicKey",
          index: false,
        },
        {
          name: "orderAccount",
          type: "publicKey",
          index: false,
        },
        {
          name: "signer",
          type: "publicKey",
          index: false,
        },
        {
          name: "orderType",
          type: {
            defined: "OrderType",
          },
          index: false,
        },
      ],
    },
  ],
};
