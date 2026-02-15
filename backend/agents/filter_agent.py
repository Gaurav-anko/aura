"""
Filter Agent
Uses Google ADK to filter products from the catalog based on user criteria.
"""

import json
import os
from pathlib import Path
from typing import Optional
from google.adk.agents import Agent

# Path to products data
DATA_PATH = Path(__file__).parent.parent.parent / "data" / "products.json"


def load_products() -> list[dict]:
    """Load products from JSON file."""
    with open(DATA_PATH, "r") as f:
        return json.load(f)


def filter_products(
    category: Optional[str] = None,
    color: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> dict:
    """
    Filter products from the catalog based on criteria.
    
    Args:
        category: Filter by PRIMARY_CATEGORY (e.g., "Rugs", "Lighting", "Furniture")
        color: Filter by COLOR field (e.g., "Beige", "Black", "White")
        min_price: Minimum price filter
        max_price: Maximum price filter
        
    Returns:
        dict with filtered products list and count
    """
    products = load_products()
    filtered = []
    
    for product in products:
        # Category filter (case-insensitive)
        if category:
            product_category = product.get("PRIMARY_CATEGORY") or ""
            if category.lower() not in product_category.lower():
                continue
        
        # Color filter (case-insensitive)
        if color:
            product_color = product.get("COLOR") or ""
            secondary_color = product.get("SECONDARYCOLOUR") or ""
            if color.lower() not in product_color.lower() and color.lower() not in secondary_color.lower():
                continue
        
        # Price range filter
        product_price = product.get("PRICE", 0)
        if min_price is not None and product_price < min_price:
            continue
        if max_price is not None and product_price > max_price:
            continue
        
        filtered.append(product)
    
    return {
        "products": filtered,
        "count": len(filtered),
        "filters_applied": {
            "category": category,
            "color": color,
            "min_price": min_price,
            "max_price": max_price,
        }
    }


def get_available_categories() -> dict:
    """
    Get all unique PRIMARY_CATEGORY values from the catalog.
    
    Returns:
        dict with list of available categories
    """
    products = load_products()
    categories = set()
    
    for product in products:
        cat = product.get("PRIMARY_CATEGORY")
        if cat and cat.strip():  # Only add non-empty categories
            categories.add(cat)
    
    return {
        "categories": sorted(list(categories)),
        "count": len(categories)
    }


def get_available_colors() -> dict:
    """
    Get all unique COLOR values from the catalog.
    
    Returns:
        dict with list of available colors
    """
    products = load_products()
    colors = set()
    
    for product in products:
        color = product.get("COLOR")
        if color and color.strip():  # Only add non-empty colors
            colors.add(color)
    
    return {
        "colors": sorted(list(colors)),
        "count": len(colors)
    }


def get_price_range() -> dict:
    """
    Get the min and max price from the catalog.
    
    Returns:
        dict with min_price and max_price
    """
    products = load_products()
    prices = [p.get("PRICE", 0) for p in products if p.get("PRICE")]
    
    return {
        "min_price": min(prices) if prices else 0,
        "max_price": max(prices) if prices else 0
    }


# Create the Filter Agent
filter_agent = Agent(
    name="filter_agent",
    model="gemini-2.0-flash",
    description="Agent that filters products from the home furnishing catalog based on category, color, and price criteria.",
    instruction="""You are a product filter assistant for a home furnishing catalog.

Your job is to help users find products based on their criteria:
- Use filter_products to filter by category, color, and price range
- Use get_available_categories to show what categories are available
- Use get_available_colors to show what colors are available  
- Use get_price_range to show the price range in the catalog

When filtering:
- Category options include: Rugs, Lighting, Cushions, Throws, Decor, Furniture, Storage, Curtains, Wall Art, Mirrors, Planters
- Colors include: Beige, Black, White, Blue, Pink, Cream, Brown, Grey, Gold, Orange, Multi
- Always return the filtered products with their details

Be helpful and suggest alternatives if no products match the criteria.
""",
    tools=[
        filter_products,
        get_available_categories,
        get_available_colors,
        get_price_range,
    ],
)
