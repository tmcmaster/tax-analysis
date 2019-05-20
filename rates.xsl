<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:template match="/">
        <rates>
            <xsl:apply-templates select="//table"/>
        </rates>
    </xsl:template>

    <xsl:template match="table">
        <year>
            <xsl:attribute name="range"><xsl:value-of select="caption"/></xsl:attribute>
            <xsl:apply-templates select="." mode="rate"/>
        </year>
    </xsl:template>

    <xsl:template match="table" mode="rate">
        <xsl:apply-templates select="tbody/tr[position() &gt; 1]"/>
    </xsl:template>

    <xsl:template match="tr">
        <rate>
            <xsl:attribute name="range"><xsl:value-of select="td[1]/p"/></xsl:attribute>
            <xsl:attribute name="rate"><xsl:value-of select="td[2]/p"/></xsl:attribute>
        </rate>
    </xsl:template>
</xsl:stylesheet>

<!--        tokenize($paramCorrespdocs,'~')-->