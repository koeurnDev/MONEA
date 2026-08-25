import * as React from "react";
import Lenis from "lenis";
import { useLocation } from 'react-router-dom';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    // វិធីសាស្រ្តទី១៖ បិទ JS Smooth Scroll (Lenis) ទាំងស្រុង ហើយប្រើប្រាស់ Native CSS Scroll
    // នេះជាវិធីដែលធ្វើឱ្យការអូស (Scrolling) ស្រាល និងរលូនបំផុតដោយមិនស៊ីកម្លាំងម៉ាស៊ីន (CPU/GPU)
    return <div className="scroll-smooth">{children}</div>;
}
