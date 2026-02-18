"""
Image Fetcher Service
Fetches product images from URLs with graceful error handling.
Enhanced to fetch multiple images per product (main + alternates).
"""

import httpx
from typing import Optional
import logging

logger = logging.getLogger(__name__)


async def fetch_image_from_url(url: str, timeout: float = 10.0) -> Optional[bytes]:
    """
    Fetch image bytes from a URL.
    
    Args:
        url: The image URL to fetch
        timeout: Request timeout in seconds
        
    Returns:
        Image bytes if successful, None if failed
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=timeout, follow_redirects=True)
            response.raise_for_status()
            return response.content
    except Exception as e:
        logger.warning(f"Failed to fetch image from {url}: {e}")
        return None


async def fetch_product_images(
    products: list[dict],
    fetch_alternates: bool = True,
    max_alternates: int = 2,
) -> tuple[list[tuple[dict, list[bytes]]], list[dict]]:
    """
    Fetch images for multiple products.
    
    Uses new schema:
    - image_url: Primary product image (string)
    - alt_image_urls: Array of alternate/360 view images
    
    Args:
        products: List of product dictionaries
        fetch_alternates: Whether to fetch alternate images
        max_alternates: Maximum number of alternate images to fetch per product
        
    Returns:
        Tuple of:
        - List of (product, [image_bytes_list]) tuples for successful fetches
        - List of products that failed to fetch
    """
    successful = []
    failed = []
    
    for product in products:
        # Get primary image URL (new schema: image_url is a string)
        primary_url = product.get("image_url", "")
        alt_urls = product.get("alt_image_urls", [])
        
        if not primary_url:
            failed.append(product)
            logger.warning(f"Product {product.get('variation_id', 'unknown')} has no image_url")
            continue
        
        # Fetch main image
        product_images = []
        main_image = await fetch_image_from_url(primary_url)
        
        if main_image:
            product_images.append(main_image)
            
            # Fetch alternate images if requested (for 360 views)
            if fetch_alternates and alt_urls:
                for alt_url in alt_urls[:max_alternates]:
                    alt_image = await fetch_image_from_url(alt_url)
                    if alt_image:
                        product_images.append(alt_image)
            
            successful.append((product, product_images))
            
            logger.info(
                f"Fetched {len(product_images)} image(s) for product {product.get('variation_id', 'unknown')}"
            )
        else:
            failed.append(product)
            logger.warning(
                f"Skipping product {product.get('variation_id', 'unknown')} - main image fetch failed"
            )
    
    return successful, failed
