"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { jobAPI } from "@/lib/api"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  qualifications: z.string().min(10, {
    message: "Qualifications must be at least 10 characters.",
  }),
  department: z.string().min(2, {
    message: "Department is required.",
  }),
  location: z.string().min(2, {
    message: "Location is required.",
  }),
  job_type: z.enum(["Internal", "External"], {
    required_error: "Job type must be 'Internal' or 'External'.",
  }),
  deadline: z.date({
    required_error: "Please select a deadline date.",
  }),
  status: z.enum(["draft", "active", "closed"], {
    required_error: "Status must be 'draft', 'active', or 'closed'.",
  }).default("active"),
})

interface JobFormProps {
  job?: any
  isEditing?: boolean
  onSuccess?: () => void
}

export function JobForm({ job, isEditing = false, onSuccess }: JobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      qualifications: "",
      department: "",
      location: "",
      job_type: "Internal",
      status: "active",
    },
  })
  
  // If editing, populate form with job data
  useEffect(() => {
    if (isEditing && job) {
      // Parse date string to Date object if needed
      const deadlineDate = typeof job.deadline === 'string' 
        ? parse(job.deadline, 'yyyy-MM-dd', new Date()) 
        : new Date(job.deadline)
      
      form.reset({
        title: job.title || "",
        description: job.description || "",
        qualifications: job.qualifications || "",
        department: job.department || "",
        location: job.location || "",
        job_type: job.job_type || "Internal",
        deadline: deadlineDate,
        status: job.status || "active",
      })
    }
  }, [isEditing, job, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Create a formatted version of values for the API
      // The backend expects a specific format for date and status
      const apiValues = {
        title: values.title,
        description: values.description,
        qualifications: values.qualifications,
        department: values.department,
        location: values.location,
        job_type: values.job_type,
        deadline: values.deadline.toISOString(), // ISO format with time
        status: values.status // Simple string format 
      };
      
      console.log("Submitting job data:", apiValues);
      console.log("Auth token present:", Boolean(localStorage.getItem("token")));
      
      let response
      
      if (isEditing && job) {
        response = await jobAPI.updateJob(job.id, apiValues)
        toast({
          title: "Job Updated",
          description: `Job "${values.title}" has been updated successfully.`,
        })
      } else {
        response = await jobAPI.createJob(apiValues)
        toast({
          title: "Job Created",
          description: `Job "${values.title}" has been created successfully.`,
        })
        form.reset()
      }
      
      if (onSuccess) {
        onSuccess()
      } else if (!isEditing) {
        // Redirect to the vacancies page after successful creation
        router.push("/admin/jobs")
      }
    } catch (error: any) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} job:`, error)
      
      // Enhanced error logging
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
        console.error(`Headers:`, error.response.headers);
      }
      
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to ${isEditing ? 'update' : 'create'} job. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Senior Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="job_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Internal">Internal</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Internal jobs are only for current employees
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Finance" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Headquarters, Addis Ababa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed job description..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="qualifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualifications</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Required qualifications and experience..." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Application Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Only active jobs will be visible to applicants
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting 
            ? (isEditing ? "Updating..." : "Creating...") 
            : (isEditing ? "Update Job" : "Create Job")}
        </Button>
      </form>
    </Form>
  )
} 