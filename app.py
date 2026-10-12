"""
Love Food — Food Waste Intelligence
AI for Business & Commerce Prototype
"""
import os
import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="Love Food — Food Waste Intelligence",
    page_icon="🥗",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown("""
<style>
    /* Full bleed light theme across all viewport wrappers */
    html, body, [data-testid="stAppViewContainer"], [data-testid="stHeader"], [data-testid="stToolbar"], .stApp, section.main, .main, div.block-container {
        background-color: #f8fafc !important;
        background: #f8fafc !important;
        color: #0f172a !important;
        overflow-x: hidden !important;
    }
    
    header[data-testid="stHeader"] { display: none !important; }
    #MainMenu { visibility: hidden !important; }
    footer { visibility: hidden !important; }
    div[data-testid="stToolbar"] { display: none !important; }
    div[data-testid="stDecoration"] { display: none !important; }
    div[data-testid="stStatusWidget"] { display: none !important; }
    
    /* Zero padding & margin */
    .main .block-container {
        padding-top: 0rem !important;
        padding-bottom: 0rem !important;
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        margin: 0rem !important;
        max-width: 100% !important;
    }
    
    /* Iframe expands dynamically */
    iframe {
        width: 100% !important;
        min-height: 850px !important;
        border: none !important;
        background-color: #f8fafc !important;
        display: block !important;
    }
</style>
""", unsafe_allow_html=True)

# Read self-contained HTML
html_path = os.path.join(os.path.dirname(__file__), "index.html")
with open(html_path, "r", encoding="utf-8") as f:
    html_content = f.read()

# Dynamic height default 880, auto-resized by postMessage
components.html(html_content, height=880, scrolling=True)
