import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TotalValue = () => (
  <Card className="mt-4 bg-indigo-600">
    <CardHeader>
      <CardTitle className="text-white">$412.39</CardTitle>
      <CardDescription className="text-slate-100">
        Total asset value
      </CardDescription>
    </CardHeader>
  </Card>
);

export default TotalValue;
