import SchoolPassportPage from "@/components/schools/school-passport-page";

interface Props {
  params: {
    id: string;
    lang: string;
  };
}

export default function SchoolPassportPageRoute({ params }: Props) {
  return <SchoolPassportPage schoolId={params.id} />;
}
