import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listingService, serviceService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft,ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function EditListingPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [available, setAvailable] = useState(true);
  const [serviceId, setServiceId] = useState<number | "">("");
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!listingId) {
          setError(t("error") + ": " + t("no_listing_id"));
          return;
        }
        const [listing, allServices] = await Promise.all([
          listingService.getListingById(listingId),
          serviceService.getAllServices(),
        ]);
        setTitle(listing.title);
        setDescription(listing.description || "");
        setMinPrice(listing.min_price);
        setMaxPrice(listing.max_price);
        setLocation(listing.location);
        setAvailable(listing.available);
        setServiceId(listing.service_id);
        setServices(allServices);
      } catch (err) {
        setError(t("error") + ": " + t("failed_to_load_listing_or_services"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [listingId, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!listingId) {
        setError(t("error") + ": " + t("no_listing_id"));
        return;
      }
      await listingService.updateListing(listingId, {
        title,
        description,
        min_price: Number(minPrice),
        max_price: Number(maxPrice),
        location,
        available,
        service_id: Number(serviceId),
      });
      toast.success(t("success") + ": " + t("listing_updated_successfully"));
      navigate("/profile/me");
    } catch (err) {
      setError(t("error") + ": " + t("failed_to_update_listing"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{t("loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => navigate(-1)}>{t("back")}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4" dir={i18n.dir()}>
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        {i18n.dir() === "rtl" ? (
          <>
        {t("back")}
        <ArrowRight className="h-4 w-4 ml-2" />
          </>
        ) : (
          <>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("back")}
          </>
        )}
      </Button>
      <h1 className="text-2xl font-bold mb-6">
        {t("edit")} {t("listing")}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-medium">{t("title")}</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("description")}</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">{t("min_price")}</label>
            <Input
              type="number"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : "")}
              min={0}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">{t("max_price")}</label>
            <Input
              type="number"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
              min={0}
              required
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("location")}</label>
          <Input value={location} onChange={e => setLocation(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("category")}</label>
          <Select value={serviceId ? String(serviceId) : undefined} onValueChange={val => setServiceId(Number(val))}>
            <SelectTrigger>
              <SelectValue placeholder={t("choose_service")} />
            </SelectTrigger>
            <SelectContent>
              {services.map(service => (
                <SelectItem key={service.id} value={String(service.id)}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("available")}</label>
          <input
            type="checkbox"
            checked={available}
            onChange={e => setAvailable(e.target.checked)}
            className="ml-2"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t("save_changes")}
          </Button>
        </div>
      </form>
    </div>
  );
}
