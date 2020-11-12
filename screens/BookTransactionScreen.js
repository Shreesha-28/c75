import React from 'react';
import {Text,TouchableOpacity,View,StyleSheet,Image, TouchableHighlightBase}from 'react-native';
import *as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
import { TextInput } from 'react-native-gesture-handler';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedBookId:'',
            scannedStudent:'',
            buttonState:'normal',
            transcationMessage:''
        }
    }

    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);

        this.setState({
            //status==="granted" is true when the user has granted the permissions
            //status==="granted"is false when the user has not granted permissions
            hasCameraPermissions:status==="granted",
            buttonState:id,
            scanned:false
        })
    }

    handleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==="BookId"){
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:'normal'
            })
        }
        else if(buttonState==="StudentId"){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
            })
        }
    }

    initiateBookIssue=async()=>{
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"Issue"
        })

        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':false
        })

        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
    }
    initiateBookReturn=async()=>{
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"Return"
        })

        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':true
        })

        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
    }
    checkBookEligibility=async()=>{
        const bookRef=await db.collection("books").where("bookId","==",this.state.scannedBookId).get()
        var transactionType=""
        if(bookRef.docs.length===0){
            transactionType=false;
            alert("bookDoesnt Exist in our library get out")
        }
        else{
            bookRef.docs.map((doc)=>{
                var book=doc.data()
                if(book.bookAvailability){
                    transactionType="issue"
                }
                else{
                    transactionType="return"
                }
            })
        }
        return transactionType
    }
    checkStudentEligiblityForBookIssue=async()=>{
        const studentRef=await db.collection("students").where("studentId","==",this.state.scannedStudentId).get()
        var isStudentEligible=""
        if(StudentRef.docs.length===0){
            isStudentEligible=false;
            alert("student id Doesnt Exist in our database get out")
            this.setState({
                scannedBookId:'',
                scannedStudentId:''
            })
        }
        else{
            studentRef.docs.map((doc)=>{
                var student=doc.data()
                if(student.numberOfBooksIssued<2){
                    isStudentEligible=true
                }
                else{
                    isStudentEligible=false;
                    alert("student has already issued 2 books")
                    this.setState({
                        scannedBookId:'',
                        scannedStudentId:''
                    })
                }
            })
        }
        return isStudentEligible
    }
    checkStudentEligiblityForBookReturn=async()=>{
        const transactionRef=await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
        var isStudentEligible=""
        transactionRef.docs.map((doc)=>{
            var lastBookTransaction=doc.data();
            if(lastBookTransaction.studentId===this.state.scannedStudentId){
                isStudentEligible=true
            }
            else{
                isStudentEligible=false;
                alert("the book was not issued by the student ask him to go out")
                this.setState({
                    scannedBookId:'',
                    scannedStudentId:''
                })
            
            }
        })
        return isStudentEligible
    }

    handleTransaction=async()=>{
        var transactionType=await this.checkBookEligibility();
        if (!transactionType){
            alert("book does not exist in our library get out")
            this.setState({
                scannedStudentId:'',
                scannedBookId:''
            })
        }     
        else if(transactionType==="Issue"){
            var isStudentEligible=await this.checkStudentEligiblityForBookIssue()
            if(isStudentEligible){
                this.initiateBookIssue()
                alert("book Issued To Student")
           }
           else{
            var isStudentEligible=await this.checkStudentEligiblityForBookReturn()
            if(isStudentEligible){
                this.initiateBookReturn()
                alert("book Returned by Student")
           }
           }
        }   
    }
    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState;
       
        if(buttonState!=="normal"&& hasCameraPermissions){
            return(
                <BarCodeScanner
                onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
                />

            )
        }
        else if(buttonState==="normal"){
            return(
               <View style={styles.container}>
                   <View>
                   <Image
          source={require("../assets/booklogo.jpg")}
          style={{width:200,height:200}}/>
          <Text style={{textAlign:'center',fontSize:30}}>wily</Text>
                   </View>
                   <View style={styles.inputView}>
                       <TextInput
                       style={styles.inputBox}
                       placeholder="book id"
                       onChangeText={(text)=>{
                           this.setState({scannedBookId:text})
                       }}
                       value={this.state.scannedBookId}/>
                       <TouchableOpacity
                       style={styles.scanButton}
                       onPress={()=>{
                           this.getCameraPermissions("BookId")
                       }}>
                           <Text style={styles.buttonText}>Scan</Text>
                       </TouchableOpacity>
                   </View>
                   <View style={styles.inputView}>
                       <TextInput
                       style={styles.inputBox}
                       placeholder="student id"
                       onChangeText={(text)=>{
                        this.setState({scannedStudentId:text})
                    }}
                       value={this.state.scannedStudentId}/>
                       <TouchableOpacity
                       style={styles.scanButton}
                       onPress={()=>{
                           this.getCameraPermissions("StudentId")
                       }}>
                           <Text style={styles.buttonText}>Scan</Text>
                       </TouchableOpacity>
                   </View>
                   <TouchableOpacity
                   style={styles.submitButton}
                   onPress={async()=>{
                       var transactionMessage=await this.handleTransaction();
                   }}>
                       <Text style={styles.submitButtonText}>Submit</Text>
                   </TouchableOpacity>
               </View>
            )
        }

    }
}
const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    displayText:{
        fontSize:15,
        textDecorationLine:'underline',
    },
    scanButton:{
        backgroundColor:'#2196f3',
        padding:10,
        margin:10,
    },
    buttonText:{
        fontSize:20,
        textAlign:'center',
        marginTop:10
    },
    inputView:{
        flexDirection:'row',
        margin:20,
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20,
    },
    scanButton:{
        backgroundColor:'#66bb6a',
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0,
    },
    submitButton:{
        backgroundColor:'#fbc02d',
        width:100,
        height:50,
    },
    submitButtontext:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:"bold",
        color:'white'
    }
    
})