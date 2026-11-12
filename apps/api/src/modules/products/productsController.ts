import { Router, Request, Response, NextFunction } from "express";
import {
  getAllProducts,
  getProductByIdOrSlug,
  getProductsByIds,
  createOrUpdateProduct,
} from "./productsService.js";
import { requireMerchantAuth } from "../../middleware/auth.js";

const router = Router();

// GET /api/products
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, q, minPrice, maxPrice, limit, sort } = req.query;
    const products = await getAllProducts({
      category: category as string,
      query: q as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      sort: sort as string,
    });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/compare?ids=id1,id2
router.get("/compare", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ids = (req.query.ids as string)?.split(",").filter(Boolean) || [];
    if (ids.length < 2) {
      return res.status(400).json({ success: false, message: "Provide at least 2 product IDs to compare" });
    }
    const products = await getProductsByIds(ids);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:idOrSlug
router.get("/:idOrSlug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await getProductByIdOrSlug(req.params.idOrSlug);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// POST /api/products (Merchant Only)
router.post("/", requireMerchantAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await createOrUpdateProduct(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id (Merchant Only)
router.put("/:id", requireMerchantAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await createOrUpdateProduct({ ...req.body, id: req.params.id });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

export const productsController = router;
