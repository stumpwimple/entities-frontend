import React, { useState } from "react";
import {
  TextField,
  Button,
  makeStyles,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    position: "fixed",
    left: "15%",
    width: "800px",
    height: "800px",
    borderRadius: "50%",
    backgroundColor: "cyan",
    border: "5px solid white",
    opacity: 0.5,
    overflow: "hidden",
    transition: "bottom 0.3s, opacity 0.3s",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    cursor: "pointer",
    zIndex: 9999,
    "&:hover": {
      opacity: 0.95,
    },
  },
  content: {
    padding: "8px",
    textAlign: "center",
    marginTop: "8px",
  },
  searchField: {
    height: "40px",
    "& .MuiInputBase-root": {
      height: "40px",
      fontSize: "14px",
    },
  },
  filterText: {
    fontSize: "14px",
    marginTop: "2px",
  },
});

function SearchDrawer({ searchTerm, setSearchTerm }) {
  const [expanded, setExpanded] = useState(false);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [autoSearch, setAutoSearch] = useState(false);

  const classes = useStyles({ expanded });

  const bottomPosition = expanded ? "-30vh" : "-720px";

  return (
    <div
      className={classes.root}
      style={{
        bottom: bottomPosition,
        opacity: expanded ? 0.95 : undefined,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className={classes.content}>
        {tempSearchTerm && (
          <Button
            size="small"
            variant="standard"
            onClick={(e) => {
              e.stopPropagation();
              setTempSearchTerm("");
              setSearchTerm("");
            }}
            style={{
              marginRight: 2,
              marginLeft: 2,
              padding: 2,
              minHeight: 25,
              minWidth: 25,
              verticalAlign: "bottom",
              position: "relative",
              bottom: "-6px",
            }}
          >
            X
          </Button>
        )}
        <TextField
          label="Search"
          variant="standard"
          value={tempSearchTerm}
          onChange={(e) => {
            setTempSearchTerm(e.target.value);
            if (autoSearch) {
              setSearchTerm(e.target.value);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          placeholder="Search by name, type, or description"
          className={classes.searchField}
        />
        <Button
          style={{ marginTop: "14px", fontSize: "14px", padding: "4px 8px" }}
          onClick={(e) => {
            e.stopPropagation();
            setSearchTerm(tempSearchTerm);
          }}
        >
          Scry
        </Button>
        <FormControlLabel
          control={
            <Checkbox
              checked={autoSearch}
              onChange={() => setAutoSearch(!autoSearch)}
              onClick={(e) => {
                e.stopPropagation();
                setSearchTerm(tempSearchTerm);
              }}
            />
          }
          label="Auto"
          style={{ marginLeft: "8px", marginTop: "8px" }}
        />
        <Typography variant="body2" className={classes.filterText}>
          More Filter Options
        </Typography>
        {expanded && <>Not Yet</>}
      </div>
    </div>
  );
}

export default SearchDrawer;
