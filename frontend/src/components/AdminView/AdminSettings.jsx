import React ,{useEffect,useState} from "react";
import authApi from "../../services/api";
import {toast} from "react-toastify";
function AdminSettings(){
    const[freeTrialUses,setFreeTrialUses]=useState("");
    const [paidAmount,setPaidAmount]=useState("");
    const token=localStorage.getItem("token");
    async function getSettings(){
        try{
            const res=await authApi.get("/settings");
            setFreeTrialUses(res.data.freeTrialUses);
            setPaidAmount(res.data.paidAmount);
        }catch(err){
            console.log(err);
            toast.error("Could not fetch settings");
        }
    }
    async function updateSettings(e){
        e.preventDefault();
        try{
            await authApi.put("/settings",{freeTrialUses,paidAmount});
            toast.success("Settings updated successfully");
        }catch(err){
            console.log(err);
            toast.error("Could not update settings");
        }
    }
    useEffect(()=>{
        getSettings();
    },[]);
    return(
        <div className="admin-settings-page">
            <div className="settings-card">
                <h2>Payment and Trial settings</h2>
                <form onSubmit={updateSettings}>
                    <div className="settings-field">
                        <label>Number of Free Trial Uses</label>
                        <input type="number" value={freeTrialUses} onChange={(e)=>setFreeTrialUses(e.target.value)} min="0"/>
                    </div>
                    <div className="settings-field">
                        <label>Paid Plan Amount (INR)</label>
                        <input type="number" value={paidAmount} onChange={(e)=>setPaidAmount(e.target.value)} min="1"/>
                    </div>
                    <button className="settings-save-btn" typ="submit">
                        Save Settings
                    </button>
                </form>
            </div>
        </div>
    )
}
export default AdminSettings;