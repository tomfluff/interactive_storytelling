import "./PremiseBar.css";
import * as React from "react";
import { TPremise } from "../../types/Story";
import { Box, Button, Stack, Typography } from "@mui/material";

interface IPremiseBarProps {
  items: TPremise[];
}

const PremiseBar: React.FC<IPremiseBarProps> = (props) => {
  const [premise, setPremise] = React.useState<TPremise | null>(null);

  const handlePremiseClick = (premise: TPremise) => {
    setPremise(premise);
  };

  return (
    <Box className="premise-bar">
      <Box className="premise-selection">
        <Stack direction="column" spacing={2}>
          {props.items.map((item, index) => {
            return (
              <Button
                key={index}
                onClick={() => handlePremiseClick(item)}
                className="premise-button"
              >
                {item.setting.short}
              </Button>
            );
          })}
        </Stack>
      </Box>
      <Box className="premise-content">
        <Typography variant="h2">{premise?.setting.long}</Typography>
        <Typography variant="body1">{premise?.story}</Typography>
      </Box>
    </Box>
  );
};

export default PremiseBar;
