import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { jobFormSchema, slugify, type JobFormInput } from "@ijp/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";
import { RichTextEditor } from "@/components/RichTextEditor";
import { createJob, fetchJob, updateJob } from "@/api/jobs";

export function JobFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const jobQuery = useQuery({
    queryKey: ["job", id],
    queryFn: () => fetchJob(id as string),
    enabled: isEditMode,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<JobFormInput>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      location: "",
      vacancies: 1,
      aboutTheRole: "",
      published: false,
    },
  });

  useEffect(() => {
    if (jobQuery.data) {
      reset({
        title: jobQuery.data.title,
        location: jobQuery.data.location,
        vacancies: jobQuery.data.vacancies,
        aboutTheRole: jobQuery.data.aboutTheRole,
        published: jobQuery.data.published,
      });
    }
  }, [jobQuery.data, reset]);

  const titleValue = watch("title");
  const previewSlug = isEditMode
    ? jobQuery.data?.slug
    : slugify(titleValue || "");

  const mutation = useMutation({
    mutationFn: (input: JobFormInput) =>
      isEditMode ? updateJob(id as string, input) : createJob(input),
    onSuccess: (job) => {
      toast.success(job.published ? "Job published." : "Job saved as draft.");
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      navigate("/jobs");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not save the job.",
      );
    },
  });

  const handleSaveDraft = handleSubmit((values) =>
    mutation.mutate({ ...values, published: false }),
  );
  const handlePublish = handleSubmit((values) =>
    mutation.mutate({ ...values, published: true }),
  );

  if (isEditMode && jobQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isEditMode && jobQuery.isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Could not load this job.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/jobs">
            <ArrowLeft />
            <span className="sr-only">Back to Jobs</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEditMode ? "Edit Job" : "New Job"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Update this job posting on the careers site."
              : "Create a new job posting for the careers site."}
          </p>
        </div>
        {isEditMode && jobQuery.data && (
          <Badge
            variant={jobQuery.data.published ? "success" : "secondary"}
            className="ml-auto"
          >
            {jobQuery.data.published ? "Published" : "Draft"}
          </Badge>
        )}
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={(event) => event.preventDefault()}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" {...register("title")} />
              <FormError message={errors.title?.message} />
              {previewSlug && (
                <p className="text-xs text-muted-foreground">
                  URL slug: <span className="font-mono">{previewSlug}</span>
                  {isEditMode && " (unchanged when editing)"}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} />
                <FormError message={errors.location?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vacancies">Vacancies</Label>
                <Input
                  id="vacancies"
                  type="number"
                  min={1}
                  max={1000}
                  step={1}
                  {...register("vacancies", { valueAsNumber: true })}
                />
                <FormError message={errors.vacancies?.message} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>About the Role</Label>
              <Controller
                control={control}
                name="aboutTheRole"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describe the role, responsibilities, and requirements..."
                  />
                )}
              />
              <FormError message={errors.aboutTheRole?.message} />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/jobs")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={handleSaveDraft}
              >
                {mutation.isPending && <Loader2 className="animate-spin" />}
                Save Draft
              </Button>
              <Button
                type="button"
                disabled={mutation.isPending}
                onClick={handlePublish}
              >
                {mutation.isPending && <Loader2 className="animate-spin" />}
                Publish
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
