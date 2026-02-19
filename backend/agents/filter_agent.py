"""
Filter Agent
Uses Google ADK to filter products from the catalog based on user criteria.
"""

import json
import os
import re
import logging
from pathlib import Path
from typing import Optional
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# Configure logging
logger = logging.getLogger(__name__)

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
        category: Filter by CLASS_DESCRIPTION (e.g., "RUGS & MATS", "LIGHTING", "CONTAINERS/BASKETS")
        color: Filter by COLOR field (e.g., "Beige", "Black", "White")
        min_price: Minimum price filter
        max_price: Maximum price filter
        
    Returns:
        dict with filtered products list and count
    """
    products = load_products()
    filtered = []
    
    for product in products:
        # Category filter (case-insensitive) - check CLASS_DESCRIPTION and SUB_CLASS_DESCRIPTION
        if category:
            product_class = product.get("CLASS_DESCRIPTION") or ""
            product_subclass = product.get("SUB_CLASS_DESCRIPTION") or ""
            combined = f"{product_class} {product_subclass}".lower()
            if category.lower() not in combined:
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
    Get all unique CLASS_DESCRIPTION values from the catalog.
    
    Returns:
        dict with list of available categories
    """
    products = load_products()
    categories = set()
    
    for product in products:
        cat = product.get("CLASS_DESCRIPTION")
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


# Initialize ADK Runner for filter agent
session_service = InMemorySessionService()
filter_runner = Runner(
    agent=filter_agent,
    app_name="home-style-ai",
    session_service=session_service,
)


async def run_filter_search(query: str, user_id: str = "default_user", session_id: str = None) -> dict:
    """
    Run the filter agent with a natural language query.
    Uses Gemini to parse the query into filter parameters, then calls filter_products.
    
    Args:
        query: Natural language search query (e.g., "blue rugs under $50")
        user_id: User identifier for session tracking
        session_id: Session identifier (auto-generated if not provided)
        
    Returns:
        dict with filtered products and search metadata
    """
    from google import genai
    import os
    
    logger.info(f"Running filter search: '{query}'")
    
    try:
        # Get available options for context
        categories = get_available_categories()["categories"]
        colors = get_available_colors()["colors"]
        price_range = get_price_range()
        
        # Use Gemini to parse the natural language query into filter parameters
        client = genai.Client(
            vertexai=True,
            project=os.getenv("GOOGLE_CLOUD_PROJECT", "codegen-714"),
            location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
        )
        
        parse_prompt = f"""Parse this product search query and extract filter parameters.

Query: "{query}"

Available categories: {categories}
Available colors: {colors}
Price range: ${price_range['min_price']} - ${price_range['max_price']}

Return ONLY a JSON object with these fields (use null if not specified):
{{
    "category": "category name or null",
    "color": "color name or null", 
    "min_price": number or null,
    "max_price": number or null
}}

Match categories and colors to the closest available option. Be flexible with matching (e.g., "rugs" matches "RUGS & MATS", "kitchen" matches categories with kitchen items).

Return ONLY the JSON, no explanation."""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[parse_prompt],
        )
        
        # Parse the JSON response
        response_text = response.text.strip()
        logger.info(f"Gemini parse response: {response_text}")
        
        # Clean up response (remove markdown code blocks if present)
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        response_text = response_text.strip()
        
        import json as json_module
        parsed_filters = json_module.loads(response_text)
        
        # Extract filters
        category = parsed_filters.get("category")
        color = parsed_filters.get("color")
        min_price = parsed_filters.get("min_price")
        max_price = parsed_filters.get("max_price")
        
        logger.info(f"Parsed filters - category: {category}, color: {color}, min_price: {min_price}, max_price: {max_price}")
        
        # Call filter_products with extracted parameters
        result = filter_products(
            category=category,
            color=color,
            min_price=min_price,
            max_price=max_price,
        )
        
        return {
            "success": True,
            "products": result["products"],
            "count": result["count"],
            "query": query,
            "filters_applied": result["filters_applied"],
            "agent_response": f"Found {result['count']} products matching '{query}'",
        }
        
    except Exception as e:
        logger.error(f"Filter search error: {e}")
        # Fallback: try simple keyword matching
        try:
            logger.info("Falling back to simple keyword search")
            products = load_products()
            query_lower = query.lower()
            
            # Simple keyword filtering
            filtered = []
            for p in products:
                product_text = f"{p.get('ITEM_NAME', '')} {p.get('CLASS_DESCRIPTION', '')} {p.get('COLOR', '')} {p.get('generated_tags', [])}".lower()
                if any(word in product_text for word in query_lower.split() if len(word) > 2):
                    filtered.append(p)
            
            return {
                "success": True,
                "products": filtered[:50],  # Limit results
                "count": len(filtered[:50]),
                "query": query,
                "filters_applied": {"keyword": query},
                "agent_response": f"Found {len(filtered)} products (keyword search)",
            }
        except Exception as e2:
            logger.error(f"Fallback search also failed: {e2}")
            return {
                "success": False,
                "products": [],
                "count": 0,
                "query": query,
                "error": str(e),
            }