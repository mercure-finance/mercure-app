import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// @ts-ignore
const TotalValue = ({ tokens }) => {
  // @ts-ignore
  const getTotalValue = (stocks: Stock[]): number => {
    let totalValue = 0;

    if (tokens) {
      for (let stock of stocks) {
        if (stock.price && stock.tokenAmount) {
          totalValue += stock.price * stock.tokenAmount;
        }
      }
    }

    return totalValue;
  };

  const total = getTotalValue(tokens);
  return (
    <Card className="mt-4 bg-indigo-600">
      <CardHeader>
        <CardTitle className="text-white">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            // @ts-ignore
          }).format(total)}
        </CardTitle>
        <CardDescription className="text-slate-100">
          Total asset value
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default TotalValue;
