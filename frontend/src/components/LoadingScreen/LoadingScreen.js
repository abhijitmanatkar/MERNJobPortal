import CircularProgress from "@material-ui/core/CircularProgress";

const style = {
  display: "flex",
  position: "fixed",
  height: "100%",
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
};

function LoadingScreen() {
  return (
    <div className="LoadingScreen" style={style}>
      <CircularProgress size={80} />
    </div>
  );
}

export default LoadingScreen;
