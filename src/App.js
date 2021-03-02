import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { HEROES, COMICS } from './custom/data';
import { shuffle, getTimeLeft, move, GAME_STATE } from './custom/utils';
import Modal from './components/Modal';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import Footer from './components/Footer';
import Highscore from './components/Highscore';
import styled from 'styled-components';


const GAME_DURATION = 4000 * 60 * 2; // 2 minutes

const initialState = {
  // we initialize the state by populating the bench with a shuffled collection of heroes
  Óflokkað: shuffle(HEROES),
  [COMICS.products]: [],
  [COMICS.services]: [],
  gameState: GAME_STATE.READY,
  timeLeft: 0,
};

class App extends React.Component {
  state = initialState;

  startGame = () => {
    this.currentDeadline = Date.now() + GAME_DURATION;

    this.setState(
      {
        gameState: GAME_STATE.PLAYING,
        timeLeft: getTimeLeft(this.currentDeadline),
      },
      this.gameLoop
    );
  };

  gameLoop = () => {
    this.timer = setInterval(() => {
      const timeLeft = getTimeLeft(this.currentDeadline);
      const isTimeout = timeLeft <= 0;
      if (isTimeout && this.timer) {
        clearInterval(this.timer);
      }

      this.setState({
        timeLeft: isTimeout ? 0 : timeLeft,
        ...(isTimeout ? { gameState: GAME_STATE.DONE } : {}),
      });
    }, 1000);
  };

  endGame = () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.state.gameState === GAME_STATE.PLAYING) {
      this.setState({
        gameState: GAME_STATE.DONE
      });
    } else {
      this.setState({
        gameState: GAME_STATE.DONE
      });
    }
  };

  resetGame = () => {
    this.setState(initialState);
  };

  onDragEnd = ({ source, destination }) => {
    if (!destination) {
      return;
    }

    this.setState(state => {
      return move(state, source, destination);
    });
  };

  render() {
    const { gameState, timeLeft, Óflokkað, ...groups } = this.state;
    const isDropDisabled = gameState === GAME_STATE.DONE || gameState === GAME_STATE.REVIEW;

    return (
      <>
        <Header gameState={gameState} timeLeft={timeLeft} endGame={this.endGame} isUngroupedEmpty={Óflokkað.length === 0}/>
        {(this.state.gameState !== GAME_STATE.PLAYING && this.state.gameState !== GAME_STATE.REVIEW) && (
          <Modal
            startGame={this.startGame}
            resetGame={this.resetGame}
            timeLeft={timeLeft}
            gameState={gameState}
            groups={groups}
          />
        )}
        {(this.state.gameState === GAME_STATE.PLAYING ||
          this.state.gameState === GAME_STATE.REVIEW ||
          this.state.gameState === GAME_STATE.DONE) && (
            <>
              <DragDropContext onDragEnd={this.onDragEnd}>
                <Title>Óflokkað</Title>
                <Dropzone id="Óflokkað" identifier="row" heroes={Óflokkað} isDropDisabled={isDropDisabled} endGame={this.endGame} gameState={gameState} />
                <SuperContainer>
                  <Container>
                    <Title>Vørur</Title>
                    <FlexContainer>
                      <FlexColumn >
                        <Dropzone
                          id={COMICS.products}
                          heroes={this.state[COMICS.products]}
                          isDropDisabled={isDropDisabled}
                          gameState={gameState}
                          identifier="column"
                        />
                      </FlexColumn>
                    </FlexContainer>
                  </Container>
                  <Container>
                    <Title>Tænastur</Title>
                    <FlexContainer>
                      <FlexColumn >
                        <Dropzone
                          id={COMICS.services}
                          heroes={this.state[COMICS.services]}
                          isDropDisabled={isDropDisabled}
                          gameState={gameState}
                          identifier="column"
                        />
                      </FlexColumn>
                    </FlexContainer>
                  </Container>
                </SuperContainer>
              </DragDropContext>
              <Highscore />
            </>
          )}
        <Footer />
      </>
    );
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

const SuperContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction:row;
  align-self: center;
`
const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction:column;
  align-self: center;
`
const FlexContainer = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  margin: 0 30px;
  align-self: stretch;
`

const Title = styled.div`
  display: flex;
  align-self: center;
  justify-content: center;
  font-weight: bold;
`

const FlexColumn = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0 20px;
  height: 90vh;
  overflow-y: auto;
`

export default App;
