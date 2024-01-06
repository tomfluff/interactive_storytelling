import "./CharacterCard.css";
import { TCharacter, TColorUsage } from "../../types/Drawing";
import PremiseBar from "../PremiseBar/PremiseBar";
import {
  Box,
  Stack,
  CircularProgress,
  Grid,
  Typography,
  Button,
} from "@mui/material";
import useFetchPremise from "../../hooks/useFetchPremise";
import { useEffect } from "react";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import useAudioStream from "../../hooks/useAudioStream";

interface ICharacterCardProps {
  character: TCharacter;
  url?: string;
  colors?: TColorUsage[];
}

const CharacterCard: React.FC<ICharacterCardProps> = ({ character, url }) => {
  const { audioRef, isPlaying, isStreaming, playAudioStream, stopAudioStream } =
    useAudioStream();

  const handlePlayText = (text: string) => {
    playAudioStream(text);
  };

  return (
    <Box className="character-card">
      <Box className="character-card__content">
        <Stack direction="row" spacing={0}>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <img
                className="character-card__image"
                src={url}
                alt="character"
              />
            </Grid>
            <Grid item xs={7}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box className="character__name">
                    <Typography variant="h6">{character.fullname}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box className="character__backstory">
                    <Typography
                      variant="body1"
                      fontFamily={"serif"}
                      fontSize={18}
                    >
                      {character.backstory}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row-reverse" spacing={2}>
                    {!isPlaying && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<MusicNoteOutlinedIcon />}
                        onClick={() => handlePlayText(character.backstory)}
                      >
                        Listen
                      </Button>
                    )}
                    {isPlaying && (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<MusicNoteOutlinedIcon />}
                        onClick={() => stopAudioStream()}
                      >
                        Stop
                      </Button>
                    )}
                    <audio ref={audioRef} />
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Box>
  );
};

export default CharacterCard;
