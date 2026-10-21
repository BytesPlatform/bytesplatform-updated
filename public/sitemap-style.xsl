<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>XML Sitemap - Bytes Platform</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            min-height: 100vh;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .header {
            background: #0073aa;
            color: white;
            padding: 40px;
            text-align: left;
          }
          
          .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 15px;
          }
          
          .header p {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 15px;
          }
          
          .header a {
            color: white;
            text-decoration: underline;
          }
          
          .header a:hover {
            opacity: 0.8;
          }
          
          .content {
            padding: 40px;
          }
          
          .sitemap-info {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 30px;
            font-size: 1rem;
            color: #495057;
          }
          
          .sitemap-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            border: 1px solid #dee2e6;
          }
          
          .sitemap-table th {
            background: #0073aa;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 1rem;
          }
          
          .sitemap-table td {
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
            vertical-align: top;
          }
          
          .sitemap-table tr:nth-child(even) {
            background: #f8f9fa;
          }
          
          .sitemap-table tr:hover {
            background: #e9ecef;
          }
          
          .sitemap-table a {
            color: #0073aa;
            text-decoration: none;
            font-weight: 500;
            display: inline-block;
            padding: 2px 0;
            border-bottom: 1px solid transparent;
            transition: all 0.2s ease;
          }
          
          .sitemap-table a:hover {
            color: #005a87;
            text-decoration: none;
            border-bottom: 1px solid #0073aa;
            background: rgba(0, 115, 170, 0.05);
            padding: 2px 4px;
            border-radius: 3px;
          }
          
          .url-list {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 20px;
            margin-top: 20px;
          }
          
          .url-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #dee2e6;
          }
          
          .url-item:last-child {
            border-bottom: none;
          }
          
          .url-item:hover {
            background: #e9ecef;
            margin: 0 -20px;
            padding-left: 20px;
            padding-right: 20px;
          }
          
          .url-link {
            color: #0073aa;
            text-decoration: none;
            font-weight: 500;
            flex: 1;
            display: inline-block;
            padding: 2px 0;
            border-bottom: 1px solid transparent;
            transition: all 0.2s ease;
          }
          
          .url-link:hover {
            color: #005a87;
            text-decoration: none;
            border-bottom: 1px solid #0073aa;
            background: rgba(0, 115, 170, 0.05);
            padding: 2px 4px;
            border-radius: 3px;
          }
          
          .url-meta {
            display: flex;
            gap: 20px;
            font-size: 0.9rem;
            color: #6c757d;
          }
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .priority-badge {
            background: #28a745;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
          }
          
          .footer a {
            color: #0073aa;
            text-decoration: none;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 768px) {
            .header {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 2rem;
            }
            
            .content {
              padding: 20px;
            }
            
            .sitemap-table {
              font-size: 0.9rem;
            }
            
            .sitemap-table th,
            .sitemap-table td {
              padding: 10px;
            }
            
            .url-meta {
              flex-direction: column;
              gap: 5px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XML Sitemap</h1>
            <p>This XML Sitemap is generated by Bytes Platform. It is what search engines like Google use to crawl and re-crawl posts/pages/products/images/archives on your website.</p>
            <a href="https://www.sitemaps.org/" target="_blank">Learn more about XML Sitemaps.</a>
          </div>
          
          <div class="content">
            <!-- Sitemap Index Section -->
            <xsl:choose>
              <xsl:when test="sitemap:sitemapindex">
                <div class="sitemap-info">
                  This XML Sitemap Index file contains <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps.
                </div>
                
                <table class="sitemap-table">
                  <thead>
                    <tr>
                      <th>Sitemap</th>
                      <th>Last Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                      <tr>
                        <td>
                          <a href="{sitemap:loc}" target="_blank">
                            <xsl:value-of select="sitemap:loc"/>
                          </a>
                        </td>
                        <td>
                          <xsl:choose>
                            <xsl:when test="sitemap:lastmod">
                              <xsl:value-of select="sitemap:lastmod"/>
                            </xsl:when>
                            <xsl:otherwise>
                              Not specified
                            </xsl:otherwise>
                          </xsl:choose>
                        </td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </xsl:when>
              
              <!-- URL List Section -->
              <xsl:when test="sitemap:urlset">
                <div class="sitemap-info">
                  This XML Sitemap contains <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs.
                </div>
                
                <div class="url-list">
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <div class="url-item">
                      <a href="{sitemap:loc}" class="url-link" target="_blank">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                      <div class="url-meta">
                        <xsl:if test="sitemap:lastmod">
                          <div class="meta-item">
                            <span>📅</span>
                            <span><xsl:value-of select="sitemap:lastmod"/></span>
                          </div>
                        </xsl:if>
                        <xsl:if test="sitemap:changefreq">
                          <div class="meta-item">
                            <span>🔄</span>
                            <span><xsl:value-of select="sitemap:changefreq"/></span>
                          </div>
                        </xsl:if>
                        <xsl:if test="sitemap:priority">
                          <div class="meta-item">
                            <span class="priority-badge"><xsl:value-of select="sitemap:priority"/></span>
                          </div>
                        </xsl:if>
                      </div>
                    </div>
                  </xsl:for-each>
                </div>
              </xsl:when>
              
              <!-- Fallback for any other XML structure -->
              <xsl:otherwise>
                <div class="sitemap-info">
                  <p>This XML file contains sitemap data. If you're seeing this message, the XSL transformation may not be working properly.</p>
                  <p>Raw XML content:</p>
                  <pre><xsl:copy-of select="."/></pre>
                </div>
              </xsl:otherwise>
            </xsl:choose>
          </div>
          
          <div class="footer">
            <p>Generated by <a href="https://www.bytesplatform.com" target="_blank">Bytes Platform</a> | 
            <a href="https://www.sitemaps.org/" target="_blank">Sitemap Protocol</a></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 