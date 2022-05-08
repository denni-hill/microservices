export const JWTokens: {
  secret: string | undefined;
} = {
  secret: undefined
};

export const config = () => {
  if (process.env.JWT_SECRET === undefined) {
    console.error(
      "Services communication JWT secret is not set! Services will not trust each other!"
    );
  }

  JWTokens.secret = process.env.JWT_SECRET;
};
