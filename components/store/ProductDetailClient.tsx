"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/hooks/useCart";
import { toast } from "sonner";
import { formatFCFA, formatEUR, discountPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export interface ProductVariant {
  id: string;
  sku: string | null;
  options: Record<string, string>;
  price: number;
  price_eur: number | null;
  compare_price: number | null;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  price_eur: number | null;
  compare_price: number | null;
  stock: number;
  images: string[];
  slug: string;
  sku: string | null;
}

interface Props {
  product: Product;
  variants: ProductVariant[];
}

export default function ProductDetailClient({ product, variants }: Props) {
  const hasVariants = variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants ? variants[0] : null,
  );
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  // Effective values — from variant if selected, otherwise from product
  const price = selectedVariant?.price ?? product.price;
  const priceEur = selectedVariant?.price_eur ?? product.price_eur;
  const comparePrice = selectedVariant?.compare_price ?? product.compare_price;
  const stock = selectedVariant?.stock ?? Math.floor(Number(product.stock));
  const sku = selectedVariant?.sku ?? product.sku;

  const outOfStock = stock === 0;
  const lowStock = stock > 0 && stock <= 5;
  const hasDiscount = comparePrice != null && comparePrice > price;
  const discount = hasDiscount ? discountPercent(price, comparePrice!) : 0;

  // Build option keys from all variants (e.g. ["ram", "stockage"])
  const optionKeys = hasVariants
    ? Array.from(new Set(variants.flatMap((v) => Object.keys(v.options))))
    : [];

  // Get distinct values for a given option key
  function valuesFor(key: string) {
    return Array.from(
      new Set(variants.map((v) => v.options[key]).filter(Boolean)),
    );
  }

  // When an option value is selected, find the matching variant
  function selectOption(key: string, value: string) {
    const next = {
      ...(selectedVariant?.options ?? {}),
      [key]: value,
    };
    const match = variants.find((v) =>
      Object.entries(next).every(([k, val]) => v.options[k] === val),
    );
    if (match) setSelectedVariant(match);
  }

  function buildCartItem() {
    const variantLabel = selectedVariant
      ? Object.values(selectedVariant.options).join(" / ")
      : undefined;
    return {
      id: product.id,
      variantId: selectedVariant?.id,
      variantLabel,
      name: variantLabel ? `${product.name} — ${variantLabel}` : product.name,
      price,
      image: product.images?.[0] ?? null,
      slug: product.slug,
    };
  }

  function handleAddToCart() {
    const item = buildCartItem();
    for (let i = 0; i < qty; i++) addItem(item);
    toast.success(`${qty}× ${item.name} ajouté${qty > 1 ? "s" : ""} au panier`);
  }

  function handleBuyNow() {
    const item = buildCartItem();
    for (let i = 0; i < qty; i++) addItem(item);
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col">
      {/* ── Variant selector ─────────────────────────────────── */}
      {hasVariants && optionKeys.length > 0 && (
        <div className="mb-4 space-y-4">
          {optionKeys.map((key) => (
            <div key={key}>
              <p className="mb-2 text-sm font-semibold capitalize text-foreground">
                {key} :{" "}
                <span className="font-normal text-muted-foreground">
                  {selectedVariant?.options[key] ?? "—"}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {valuesFor(key).map((val) => {
                  const isSelected = selectedVariant?.options[key] === val;
                  // Check if this option value leads to an in-stock variant
                  const hasStock = variants.some(
                    (v) => v.options[key] === val && v.stock > 0,
                  );
                  return (
                    <button
                      key={val}
                      onClick={() => selectOption(key, val)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm font-medium transition-all",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : hasStock
                            ? "border-border hover:border-primary hover:text-primary"
                            : "border-border text-muted-foreground line-through opacity-50 cursor-not-allowed",
                      )}
                      disabled={!hasStock}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Price block ───────────────────────────────────────── */}
      <div className="rounded-xl border bg-muted/40 p-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-action">
            {formatFCFA(price)}
          </span>
          {hasDiscount && (
            <span className="text-base text-muted-foreground line-through">
              {formatFCFA(comparePrice!)}
            </span>
          )}
          {hasDiscount && discount > 0 && (
            <span className="rounded-md bg-action/10 px-2 py-0.5 text-sm font-bold text-action">
              −{discount}%
            </span>
          )}
        </div>
        {priceEur && (
          <p className="mt-1 text-xs text-muted-foreground">
            ≈ {formatEUR(priceEur)} · Taux : 1 EUR = 655,957 FCFA
          </p>
        )}
        {sku && (
          <p className="mt-1 text-xs text-muted-foreground">Réf. {sku}</p>
        )}

        {/* Stock indicator */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              outOfStock
                ? "bg-destructive"
                : lowStock
                  ? "bg-amber-400"
                  : "bg-green-500",
            )}
          />
          <span
            className={cn(
              "text-sm font-medium",
              outOfStock
                ? "text-destructive"
                : lowStock
                  ? "text-amber-600"
                  : "text-green-700",
            )}
          >
            {outOfStock
              ? "Épuisé — précommande disponible"
              : lowStock
                ? `Stock limité — ${stock} restant${stock > 1 ? "s" : ""}`
                : `En stock (${stock} unités)`}
          </span>
        </div>
      </div>

      {/* ── Quantity + CTAs ───────────────────────────────────── */}
      <div className="mt-4 space-y-3">
        {/* Quantity */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Quantité :
          </span>
          <div className="flex items-center rounded-md border bg-card">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              aria-label="Diminuer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-semibold">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))}
              disabled={qty >= stock && stock > 0}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              aria-label="Augmenter"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button
            onClick={handleAddToCart}
            disabled={outOfStock}
            variant="outline"
            size="lg"
            className="inline-flex h-12 w-full items-center justify-center gap-2 border-primary px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground sm:flex-1 sm:text-base"
          >
            <ShoppingCart className="h-5 w-5 shrink-0" />
            <span>{outOfStock ? "Épuisé" : "Ajouter au panier"}</span>
          </Button>

          <Button
            onClick={handleBuyNow}
            disabled={outOfStock}
            size="lg"
            className="inline-flex h-12 w-full items-center justify-center gap-2 bg-action px-4 text-sm font-semibold text-action-foreground hover:bg-action/90 sm:flex-1 sm:text-base"
          >
            <Zap className="h-5 w-5 shrink-0" />
            <span>Acheter maintenant</span>
          </Button>
        </div>

        {/* Devis */}
        <Link
          href={{
            pathname: "/contact-grands-comptes",
            query: {
              produit: selectedVariant
                ? `${product.name} (${Object.values(selectedVariant.options).join(" / ")})`
                : product.name,
              ref: sku ?? product.id,
            },
          }}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <FileText className="h-4 w-4" />
          Demander un devis entreprise
        </Link>

        {/* Payment methods */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Moyens de paiement acceptés
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              { src: "/assets/payments/wave.svg", alt: "Wave" },
              { src: "/assets/payments/orange-money.svg", alt: "Orange Money" },
              { src: "/assets/payments/mtn-momo.svg", alt: "MTN Mobile Money" },
              { src: "/assets/payments/moov-money.svg", alt: "Moov Money" },
              { src: "/assets/payments/visa.svg", alt: "Visa" },
              { src: "/assets/payments/mastercard.svg", alt: "Mastercard" },
            ].map(({ src, alt }) => (
              <div
                key={alt}
                className="flex h-12 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition-transform hover:scale-105 sm:h-14 sm:p-2"
              >
                <Image
                  src={src}
                  alt={alt}
                  width={60}
                  height={60}
                  className="h-full w-auto object-contain"
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Paiement sécurisé via GeniusPay. Livraison 48-72h à Abidjan.
          </p>
        </div>
      </div>
    </div>
  );
}
