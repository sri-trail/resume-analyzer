import React from "react";

export default function ATSScore({ score }) {
  const getColor = () => {
    if (score >= 80) return "#16a34a"; // green
    if (score >= 60) return "#f59e0b"; // yellow
    return "#dc2626"; // red
  };

  const getLabel = () => {
    if (score >= 80) return "Excellent ATS Compatibility";
    if (score >= 60) return "Moderate ATS Compatibility";
    return "Low ATS Compatibility";
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>ATS Score</h2>

      <div style={{ ...styles.scoreCircle, borderColor: getColor() }}>
        <span style={styles.scoreText}>{score}</span>
      </div>

      <p style={{ color: getColor(), fontWeight: "bold", marginTop: 10 }}>
        {getLabel()}
      </p>

      <div style={styles.barContainer}>
        <div style={{ ...styles.barFill, width: `${score}%`, background: getColor() }} />
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    marginBottom: "20px",
  },
  title: {
    marginBottom: "10px",
    fontSize: "20px",
    fontWeight: "600",
  },
  scoreCircle: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "8px solid",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto",
  },
  scoreText: {
    fontSize: "32px",
    fontWeight: "700",
  },
  barContainer: {
    width: "100%",
    height: "10px",
    background: "#e5e7eb",
    borderRadius: "5px",
    marginTop: "15px",
  },
  barFill: {
    height: "100%",
    borderRadius: "5px",
  },
};
