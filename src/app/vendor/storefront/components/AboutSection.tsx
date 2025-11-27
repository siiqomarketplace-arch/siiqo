"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import Button from "@/components/ui/alt/ButtonAlt";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Icon from "@/components/AppIcon";

interface AboutFormData {
  banner: string;
  logo: string;
  storeName: string;
  shortBio: string;
  categories: string;
  location: string;
  isOnline: boolean;
  enableChat: boolean;
  enableFollow: boolean;
}

const AboutSection: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AboutFormData>();

  const onSubmit = (data: AboutFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">About</h2>
        <p className="text-muted-foreground">
          This information will be displayed publicly on your storefront.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Banner and Logo */}
        <div className="space-y-2">
          <Label htmlFor="banner">Banner Image</Label>
          <Controller
            name="banner"
            control={control}
            render={({ field }) => (
              <Input id="banner" type="file" {...field} />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">Logo</Label>
          <Controller
            name="logo"
            control={control}
            render={({ field }) => <Input id="logo" type="file" {...field} />}
          />
        </div>
      </div>

      {/* Store Name */}
      <div className="space-y-2">
        <Label htmlFor="storeName">Store Name</Label>
        <Controller
          name="storeName"
          control={control}
          render={({ field }) => (
            <Input id="storeName" placeholder="Your Store Name" {...field} />
          )}
        />
      </div>

      {/* Short Bio */}
      <div className="space-y-2">
        <Label htmlFor="shortBio">Short Bio</Label>
        <Controller
          name="shortBio"
          control={control}
          render={({ field }) => (
            <Textarea
              id="shortBio"
              placeholder="Tell us about your store"
              {...field}
            />
          )}
        />
      </div>

      {/* Categories and Location */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categories">Categories Sold</Label>
          <Controller
            name="categories"
            control={control}
            render={({ field }) => (
              <Input
                id="categories"
                placeholder="e.g., Electronics, Clothing"
                {...field}
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Approx. Location</Label>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Input id="location" placeholder="e.g., New York, NY" {...field} />
            )}
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="isOnline">Online/Offline Status</Label>
          <Controller
            name="isOnline"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Switch id="isOnline" checked={value} onCheckedChange={onChange} {...field} />
            )}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="enableChat">Contact Vendor (Chat)</Label>
          <Controller
            name="enableChat"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Switch id="enableChat" checked={value} onCheckedChange={onChange} {...field} />
            )}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="enableFollow">Follow Store</Label>
          <Controller
            name="enableFollow"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Switch id="enableFollow" checked={value} onCheckedChange={onChange} {...field} />
            )}
          />
        </div>
      </div>

      <Button type="submit">
        <Icon name="Save" size={16} className="mr-2" />
        Save Changes
      </Button>
    </form>
  );
};

export default AboutSection;
