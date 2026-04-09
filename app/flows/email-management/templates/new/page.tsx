import TemplateEditor from "../_components/TemplateEditor";

export default function NewTemplatePage() {
  return (
    <TemplateEditor
      template={{
        id: "new",
        name: "",
        subject: "",
        body: "",
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }}
      isNew
    />
  );
}
